import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { getSocket } from '../services/socket';
import { getIceServers } from '../utils/config';
import { PeerMediaState } from '../types';

interface PeerContext {
  socketId: string;
  pc: RTCPeerConnection;
  isPolite: boolean;
  isMakingOffer: boolean;
  isIgnoringOffer: boolean;
  pendingCandidates: RTCIceCandidateInit[];
  hasRelayCandidate: boolean;
  restartCount: number;
  disconnectedTimer: ReturnType<typeof setTimeout> | null;
  remoteStream: MediaStream;
}

export interface UseGroupWebRTCReturn {
  remoteStreams: Record<string, MediaStream>;
  peerConnectionStates: Record<string, RTCPeerConnectionState>;
  peerMediaStates: Record<string, PeerMediaState>;
  aggregateConnectionState: RTCPeerConnectionState;
  participantCount: number;
  initGroupCall: (roomId: string, localStream: MediaStream, existingParticipants: string[]) => Promise<void>;
  leaveGroupCall: () => void;
  sendMediaState: (cameraOn: boolean, micOn: boolean) => void;
  replaceTrackOnAll: (newTrack: MediaStreamTrack, kind: 'audio' | 'video') => Promise<void>;
}

/**
 * useGroupWebRTC
 * 
 * Manages N-peer mesh WebRTC topology (2–6 participants) using WebRTC Perfect Negotiation
 * pattern per peer connection.
 * 
 * Politeness tie-breaker:
 * isPolite = socket.id < remoteSocketId (lexicographical string comparison)
 */
export function useGroupWebRTC(): UseGroupWebRTCReturn {
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [peerConnectionStates, setPeerConnectionStates] = useState<Record<string, RTCPeerConnectionState>>({});
  const [peerMediaStates, setPeerMediaStates] = useState<Record<string, PeerMediaState>>({});

  const peerContextsRef = useRef<Map<string, PeerContext>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const currentRoomIdRef = useRef<string | null>(null);
  const cleanupSocketListenersRef = useRef<(() => void) | null>(null);

  const socket = useMemo(() => getSocket(), []);

  // Compute aggregate connection state
  const aggregateConnectionState = useMemo<RTCPeerConnectionState>(() => {
    const states = Object.values(peerConnectionStates);
    if (states.length === 0) return 'new';
    if (states.some(s => s === 'connected')) return 'connected';
    if (states.some(s => s === 'connecting')) return 'connecting';
    if (states.every(s => s === 'failed')) return 'failed';
    if (states.some(s => s === 'disconnected')) return 'disconnected';
    return states[0] || 'new';
  }, [peerConnectionStates]);

  const participantCount = useMemo(() => {
    // 1 (self) + number of active remote streams or peer contexts
    return 1 + Object.keys(remoteStreams).length;
  }, [remoteStreams]);

  const logCandidatePairStats = async (socketId: string, pc: RTCPeerConnection) => {
    try {
      if (!pc || pc.connectionState === 'closed' || pc.signalingState === 'closed') return;
      const stats = await pc.getStats();
      if (!stats) return;
      stats.forEach((report) => {
        if (report && report.type === 'candidate-pair' && report.state === 'succeeded') {
          const localCandidate = report.localCandidateId ? stats.get(report.localCandidateId) : null;
          const remoteCandidate = report.remoteCandidateId ? stats.get(report.remoteCandidateId) : null;
          if (localCandidate && remoteCandidate) {
            console.log(
              `[Voxa Group] Connected to [${socketId}] via ${localCandidate.candidateType || 'unknown'} <-> ${remoteCandidate.candidateType || 'unknown'} (${localCandidate.protocol || 'udp'})`
            );
          }
        }
      });
    } catch {
      // Diagnostic fail silent
    }
  };

  const triggerIceRestart = useCallback(async (peerCtx: PeerContext) => {
    if (peerCtx.isPolite) return; // Only impolite peer initiates ICE restart
    if (peerCtx.restartCount >= 3) {
      console.warn(`[Voxa Group] Max ICE restart reached (3) for [${peerCtx.socketId}]`);
      return;
    }

    const { pc, socketId } = peerCtx;
    const roomId = currentRoomIdRef.current;
    if (!pc || !roomId) return;

    peerCtx.restartCount += 1;
    console.log(`[Voxa Group] Initiating ICE restart (${peerCtx.restartCount}/3) for [${socketId}]...`);

    try {
      if ('restartIce' in pc && typeof (pc as any).restartIce === 'function') {
        (pc as any).restartIce();
      }
      const offer = await pc.createOffer({ iceRestart: true });
      await pc.setLocalDescription(offer);
      if (pc.localDescription && currentRoomIdRef.current === roomId) {
        socket.emit('group_offer', {
          roomId,
          targetSocketId: socketId,
          sdp: pc.localDescription
        });
      }
    } catch (err) {
      console.error(`[Voxa Group] ICE restart failed for [${socketId}]:`, err);
    }
  }, [socket]);

  // Close an individual peer connection safely
  const closeSinglePeer = useCallback((socketId: string) => {
    const peerCtx = peerContextsRef.current.get(socketId);
    if (peerCtx) {
      if (peerCtx.disconnectedTimer) {
        clearTimeout(peerCtx.disconnectedTimer);
      }
      peerCtx.pc.ontrack = null;
      peerCtx.pc.onicecandidate = null;
      peerCtx.pc.onicecandidateerror = null;
      peerCtx.pc.onconnectionstatechange = null;
      peerCtx.pc.oniceconnectionstatechange = null;
      peerCtx.pc.onnegotiationneeded = null;
      peerCtx.pc.close();
      peerContextsRef.current.delete(socketId);
    }

    setRemoteStreams(prev => {
      const next = { ...prev };
      delete next[socketId];
      return next;
    });

    setPeerConnectionStates(prev => {
      const next = { ...prev };
      delete next[socketId];
      return next;
    });

    setPeerMediaStates(prev => {
      const next = { ...prev };
      delete next[socketId];
      return next;
    });

    console.log(`[Voxa Group] Closed and removed peer connection for [${socketId}]`);
  }, []);

  // Close all peer connections
  const leaveGroupCall = useCallback(() => {
    if (currentRoomIdRef.current) {
      socket.emit('leave_group', { roomId: currentRoomIdRef.current });
      currentRoomIdRef.current = null;
    }

    if (cleanupSocketListenersRef.current) {
      cleanupSocketListenersRef.current();
      cleanupSocketListenersRef.current = null;
    }

    peerContextsRef.current.forEach((ctx, socketId) => {
      if (ctx.disconnectedTimer) clearTimeout(ctx.disconnectedTimer);
      ctx.pc.close();
    });
    peerContextsRef.current.clear();

    setRemoteStreams({});
    setPeerConnectionStates({});
    setPeerMediaStates({});
    localStreamRef.current = null;
  }, [socket]);

  // Create or retrieve a peer connection for targetSocketId
  const getOrCreatePeerContext = useCallback(async (
    targetSocketId: string,
    roomId: string,
    localStream: MediaStream,
    isInitiator: boolean
  ): Promise<PeerContext> => {
    const existing = peerContextsRef.current.get(targetSocketId);
    if (existing) return existing;

    const myId = socket.id || '';
    // Politeness tie-breaker: lexicographical comparison
    const isPolite = myId < targetSocketId;

    const { iceServers, hasTurn } = await getIceServers();

    const pc = new RTCPeerConnection({
      iceServers,
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    });

    const stream = new MediaStream();

    const peerCtx: PeerContext = {
      socketId: targetSocketId,
      pc,
      isPolite,
      isMakingOffer: false,
      isIgnoringOffer: false,
      pendingCandidates: [],
      hasRelayCandidate: false,
      restartCount: 0,
      disconnectedTimer: null,
      remoteStream: stream
    };

    peerContextsRef.current.set(targetSocketId, peerCtx);

    // Initial media state
    setPeerMediaStates(prev => ({
      ...prev,
      [targetSocketId]: { cameraOn: true, micOn: true }
    }));

    // Add local media tracks & tune sender for zero delay
    localStream.getTracks().forEach(track => {
      const sender = pc.addTrack(track, localStream);
      if (track.kind === 'video') {
        track.contentHint = 'motion';
        try {
          const params = sender.getParameters();
          if (params.encodings && params.encodings.length > 0) {
            params.encodings[0].maxBitrate = 900000;
            params.encodings[0].networkPriority = 'high';
            params.degradationPreference = 'maintain-framerate';
            sender.setParameters(params).catch(() => {});
          }
        } catch {}
      } else if (track.kind === 'audio') {
        track.contentHint = 'speech';
      }
    });

    // Handle remote tracks with zero-delay playout buffer
    pc.ontrack = (event) => {
      // Force zero buffer delay on receiver
      if (event.receiver) {
        if ('playoutDelayHint' in event.receiver) {
          (event.receiver as any).playoutDelayHint = 0;
        }
        if ('jitterBufferDelayHint' in event.receiver) {
          (event.receiver as any).jitterBufferDelayHint = 0;
        }
      }

      if (event.streams && event.streams[0]) {
        setRemoteStreams(prev => ({
          ...prev,
          [targetSocketId]: event.streams[0]
        }));
      } else {
        stream.addTrack(event.track);
        setRemoteStreams(prev => ({
          ...prev,
          [targetSocketId]: new MediaStream(stream.getTracks())
        }));
      }
      setPeerConnectionStates(prev => ({
        ...prev,
        [targetSocketId]: 'connected'
      }));
    };

    // ICE Candidate Trickling
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        if (event.candidate.type === 'relay' || (event.candidate.candidate && event.candidate.candidate.includes('typ relay'))) {
          peerCtx.hasRelayCandidate = true;
        }
        if (currentRoomIdRef.current === roomId) {
          socket.emit('group_ice_candidate', {
            roomId,
            targetSocketId,
            candidate: event.candidate.toJSON()
          });
        }
      } else {
        if (!peerCtx.hasRelayCandidate && hasTurn) {
          console.warn(`[Voxa Group] ICE gathering finished with NO relay candidate for [${targetSocketId}].`);
        }
      }
    };

    // Connection state monitoring
    const updateCombinedState = () => {
      if (!peerContextsRef.current.has(targetSocketId)) return;

      const connState = pc.connectionState;
      const iceState = pc.iceConnectionState;

      if (connState === 'connected' || iceState === 'connected' || iceState === 'completed') {
        if (peerCtx.disconnectedTimer) {
          clearTimeout(peerCtx.disconnectedTimer);
          peerCtx.disconnectedTimer = null;
        }
        setPeerConnectionStates(prev => ({ ...prev, [targetSocketId]: 'connected' }));
        logCandidatePairStats(targetSocketId, pc);
      } else if (connState === 'connecting' || iceState === 'checking') {
        setPeerConnectionStates(prev => ({ ...prev, [targetSocketId]: 'connecting' }));
      } else if (connState === 'failed' || iceState === 'failed') {
        if (peerCtx.disconnectedTimer) {
          clearTimeout(peerCtx.disconnectedTimer);
          peerCtx.disconnectedTimer = null;
        }
        setPeerConnectionStates(prev => ({ ...prev, [targetSocketId]: 'failed' }));
        triggerIceRestart(peerCtx);
      } else if (connState === 'disconnected' || iceState === 'disconnected') {
        setPeerConnectionStates(prev => ({ ...prev, [targetSocketId]: 'disconnected' }));
        if (!peerCtx.disconnectedTimer) {
          peerCtx.disconnectedTimer = setTimeout(() => {
            peerCtx.disconnectedTimer = null;
            if (
              peerContextsRef.current.has(targetSocketId) &&
              (pc.iceConnectionState === 'disconnected' || pc.connectionState === 'disconnected')
            ) {
              console.warn(`[Voxa Group] Grace period expired for [${targetSocketId}]. Triggering ICE restart...`);
              triggerIceRestart(peerCtx);
            }
          }, 4000);
        }
      } else {
        setPeerConnectionStates(prev => ({ ...prev, [targetSocketId]: connState }));
      }
    };

    pc.onconnectionstatechange = updateCombinedState;
    pc.oniceconnectionstatechange = updateCombinedState;

    // Perfect Negotiation: onnegotiationneeded
    pc.onnegotiationneeded = async () => {
      // Only initiate offer if we are allowed/initiator or polite negotiation triggers it
      try {
        peerCtx.isMakingOffer = true;
        const offer = await pc.createOffer();
        if (pc.signalingState !== 'stable') return;
        await pc.setLocalDescription(offer);
        if (pc.localDescription && currentRoomIdRef.current === roomId) {
          socket.emit('group_offer', {
            roomId,
            targetSocketId,
            sdp: pc.localDescription
          });
        }
      } catch (err) {
        console.error(`[Voxa Group] negotiationneeded error for [${targetSocketId}]:`, err);
      } finally {
        peerCtx.isMakingOffer = false;
      }
    };

    return peerCtx;
  }, [socket, triggerIceRestart]);

  // Broadcast media state (camera/mic toggles) to all group members
  const sendMediaState = useCallback((cameraOn: boolean, micOn: boolean) => {
    if (currentRoomIdRef.current) {
      socket.emit('group_media_state', {
        roomId: currentRoomIdRef.current,
        cameraOn,
        micOn
      });
    }
  }, [socket]);

  // Replace track on all active peer connections (e.g. camera flip)
  const replaceTrackOnAll = useCallback(async (newTrack: MediaStreamTrack, kind: 'audio' | 'video') => {
    const promises: Promise<void>[] = [];
    peerContextsRef.current.forEach((ctx, socketId) => {
      const senders = ctx.pc.getSenders();
      const sender = senders.find(s => s.track?.kind === kind);
      if (sender) {
        promises.push(
          sender.replaceTrack(newTrack).catch(err => {
            console.error(`[Voxa Group] Failed to replace ${kind} track for [${socketId}]:`, err);
          })
        );
      }
    });
    await Promise.all(promises);
    console.log(`[Voxa Group] Replaced ${kind} track across ${peerContextsRef.current.size} mesh peer connections.`);
  }, []);

  // Initialize group calling for a room
  const initGroupCall = useCallback(async (
    roomId: string,
    localStream: MediaStream,
    existingParticipants: string[]
  ) => {
    leaveGroupCall();

    currentRoomIdRef.current = roomId;
    localStreamRef.current = localStream;

    const myId = socket.id || '';

    // Handle incoming participant:
    // Existing members in the room initiate WebRTC offer towards newcomer
    const handleParticipantJoined = async (data: { socketId: string }) => {
      console.log(`[Voxa Group] Participant joined: [${data.socketId}]. Initiating WebRTC offer...`);
      if (data.socketId === myId) return;

      const peerCtx = await getOrCreatePeerContext(data.socketId, roomId, localStream, true);
      try {
        peerCtx.isMakingOffer = true;
        const offer = await peerCtx.pc.createOffer();
        if (peerCtx.pc.signalingState !== 'stable') return;
        await peerCtx.pc.setLocalDescription(offer);
        if (peerCtx.pc.localDescription && currentRoomIdRef.current === roomId) {
          socket.emit('group_offer', {
            roomId,
            targetSocketId: data.socketId,
            sdp: peerCtx.pc.localDescription
          });
        }
      } catch (err) {
        console.error(`[Voxa Group] Failed creating offer for newcomer [${data.socketId}]:`, err);
      } finally {
        peerCtx.isMakingOffer = false;
      }
    };

    const handleParticipantLeft = (data: { socketId: string; reason?: string }) => {
      console.log(`[Voxa Group] Participant left: [${data.socketId}] (${data.reason || 'unknown'})`);
      closeSinglePeer(data.socketId);
    };

    // Targeted WebRTC Signaling Handlers
    const handleGroupOffer = async (data: { sdp: RTCSessionDescriptionInit; senderSocketId: string }) => {
      const senderId = data.senderSocketId;
      if (!senderId || senderId === myId) return;

      const peerCtx = await getOrCreatePeerContext(senderId, roomId, localStream, false);
      const pc = peerCtx.pc;

      const offerCollision = peerCtx.isMakingOffer || pc.signalingState !== 'stable';
      peerCtx.isIgnoringOffer = !peerCtx.isPolite && offerCollision;

      if (peerCtx.isIgnoringOffer) {
        console.log(`[Voxa Group] Impolite peer ignoring offer collision from [${senderId}].`);
        return;
      }

      try {
        if (offerCollision && pc.signalingState !== 'stable') {
          await Promise.all([
            pc.setLocalDescription({ type: 'rollback' }).catch(() => {}),
            pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
          ]);
        } else {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        }

        // Flush pending ICE candidates
        while (peerCtx.pendingCandidates.length > 0) {
          const cand = peerCtx.pendingCandidates.shift();
          if (cand) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch (e) {
              console.warn(`[Voxa Group] Error adding buffered candidate for [${senderId}]:`, e);
            }
          }
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        if (pc.localDescription && currentRoomIdRef.current === roomId) {
          socket.emit('group_answer', {
            roomId,
            targetSocketId: senderId,
            sdp: pc.localDescription
          });
        }
      } catch (err) {
        console.error(`[Voxa Group] Error handling group_offer from [${senderId}]:`, err);
      }
    };

    const handleGroupAnswer = async (data: { sdp: RTCSessionDescriptionInit; senderSocketId: string }) => {
      const senderId = data.senderSocketId;
      const peerCtx = peerContextsRef.current.get(senderId);
      if (!peerCtx) return;

      const pc = peerCtx.pc;
      if (pc.signalingState !== 'have-local-offer') {
        console.warn(`[Voxa Group] Ignoring answer from [${senderId}] in state:`, pc.signalingState);
        return;
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

        // Flush buffered ICE candidates
        while (peerCtx.pendingCandidates.length > 0) {
          const cand = peerCtx.pendingCandidates.shift();
          if (cand) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch (e) {
              console.warn(`[Voxa Group] Error adding pending candidate for [${senderId}]:`, e);
            }
          }
        }
      } catch (err) {
        console.error(`[Voxa Group] Error handling group_answer from [${senderId}]:`, err);
      }
    };

    const handleGroupIceCandidate = async (data: { candidate: RTCIceCandidateInit; senderSocketId: string }) => {
      const senderId = data.senderSocketId;
      const peerCtx = peerContextsRef.current.get(senderId);
      if (!peerCtx) {
        // If peer context isn't ready yet, create it
        const newCtx = await getOrCreatePeerContext(senderId, roomId, localStream, false);
        newCtx.pendingCandidates.push(data.candidate);
        return;
      }

      const pc = peerCtx.pc;
      try {
        if (pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } else {
          peerCtx.pendingCandidates.push(data.candidate);
        }
      } catch (err) {
        if (!peerCtx.isIgnoringOffer) {
          console.error(`[Voxa Group] Error adding ICE candidate from [${senderId}]:`, err);
        }
      }
    };

    const handleGroupPeerMediaState = (data: { socketId: string; cameraOn: boolean; micOn: boolean }) => {
      setPeerMediaStates(prev => ({
        ...prev,
        [data.socketId]: {
          cameraOn: data.cameraOn,
          micOn: data.micOn
        }
      }));
    };

    // Attach listeners
    socket.on('participant_joined', handleParticipantJoined);
    socket.on('participant_left', handleParticipantLeft);
    socket.on('group_offer', handleGroupOffer);
    socket.on('group_answer', handleGroupAnswer);
    socket.on('group_ice_candidate', handleGroupIceCandidate);
    socket.on('group_peer_media_state', handleGroupPeerMediaState);

    cleanupSocketListenersRef.current = () => {
      socket.off('participant_joined', handleParticipantJoined);
      socket.off('participant_left', handleParticipantLeft);
      socket.off('group_offer', handleGroupOffer);
      socket.off('group_answer', handleGroupAnswer);
      socket.off('group_ice_candidate', handleGroupIceCandidate);
      socket.off('group_peer_media_state', handleGroupPeerMediaState);
    };

    // Note: If this client is joining a room with existing participants,
    // the existing participants will receive our `participant_joined` and initiate offers to us.
    // However, if we need to pre-initialize contexts for existing members:
    for (const participantId of existingParticipants) {
      if (participantId !== myId) {
        await getOrCreatePeerContext(participantId, roomId, localStream, false);
      }
    }
  }, [socket, leaveGroupCall, closeSinglePeer, getOrCreatePeerContext]);

  // Tab foreground re-check (visibility change listener)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        peerContextsRef.current.forEach(peerCtx => {
          if (
            peerCtx.pc.connectionState === 'disconnected' ||
            peerCtx.pc.iceConnectionState === 'disconnected' ||
            peerCtx.pc.connectionState === 'failed'
          ) {
            console.log(`[Voxa Group] Tab foregrounded. Reconnecting [${peerCtx.socketId}]...`);
            triggerIceRestart(peerCtx);
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [triggerIceRestart]);

  // Teardown on unmount
  useEffect(() => {
    return () => {
      leaveGroupCall();
    };
  }, [leaveGroupCall]);

  return {
    remoteStreams,
    peerConnectionStates,
    peerMediaStates,
    aggregateConnectionState,
    participantCount,
    initGroupCall,
    leaveGroupCall,
    sendMediaState,
    replaceTrackOnAll
  };
}
