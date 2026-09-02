import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { getSocket } from '../services/socket';
import { getIceServers } from '../utils/config';
import { PeerMediaState } from '../types';

export interface UseWebRTCReturn {
  remoteStream: MediaStream | null;
  connectionState: RTCPeerConnectionState;
  peerMediaState: PeerMediaState;
  initPeerConnection: (roomId: string, isPolite: boolean, localStream: MediaStream) => Promise<void>;
  closePeerConnection: () => void;
  sendMediaState: (cameraOn: boolean, micOn: boolean) => void;
  replaceTrack: (newTrack: MediaStreamTrack, kind: 'audio' | 'video') => Promise<void>;
}

export function useWebRTC(): UseWebRTCReturn {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const [peerMediaState, setPeerMediaState] = useState<PeerMediaState>({ cameraOn: true, micOn: true });

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const isPoliteRef = useRef<boolean>(false);
  const isMakingOfferRef = useRef<boolean>(false);
  const isIgnoringOfferRef = useRef<boolean>(false);
  const currentRoomIdRef = useRef<string | null>(null);
  const hasRelayCandidateRef = useRef<boolean>(false);
  const restartCountRef = useRef<number>(0);
  const disconnectedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cleanupSocketListenersRef = useRef<(() => void) | null>(null);

  const socket = useMemo(() => getSocket(), []);

  const closePeerConnection = useCallback(() => {
    // Clean up socket signaling listeners first
    if (cleanupSocketListenersRef.current) {
      cleanupSocketListenersRef.current();
      cleanupSocketListenersRef.current = null;
    }
    if (disconnectedTimerRef.current) {
      clearTimeout(disconnectedTimerRef.current);
      disconnectedTimerRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.onicecandidateerror = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.oniceconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setRemoteStream(null);
    setConnectionState('closed');
    pendingCandidatesRef.current = [];
    isMakingOfferRef.current = false;
    isIgnoringOfferRef.current = false;
    currentRoomIdRef.current = null;
    hasRelayCandidateRef.current = false;
    restartCountRef.current = 0;
  }, []);

  const sendMediaState = useCallback((cameraOn: boolean, micOn: boolean) => {
    socket.emit('media_state', { cameraOn, micOn });
  }, [socket]);

  const replaceTrack = useCallback(async (newTrack: MediaStreamTrack, kind: 'audio' | 'video') => {
    const pc = peerConnectionRef.current;
    if (!pc) return;
    const senders = pc.getSenders();
    const sender = senders.find(s => s.track?.kind === kind);
    if (sender) {
      try {
        await sender.replaceTrack(newTrack);
        console.log(`[Voxa WebRTC] Replaced ${kind} track on active peer connection.`);
      } catch (err) {
        console.error(`[Voxa WebRTC] Failed to replace ${kind} track:`, err);
      }
    }
  }, []);

  const triggerIceRestart = useCallback(async () => {
    if (isPoliteRef.current) return; // Only impolite peer initiates ICE restarts
    if (restartCountRef.current >= 3) {
      console.warn('[Voxa] Maximum ICE restart attempts reached (3).');
      return;
    }

    const pc = peerConnectionRef.current;
    const roomId = currentRoomIdRef.current;
    if (!pc || !roomId) return;

    restartCountRef.current += 1;
    console.log(`[Voxa] Initiating controlled ICE restart (${restartCountRef.current}/3)...`);

    try {
      if ('restartIce' in pc && typeof (pc as any).restartIce === 'function') {
        (pc as any).restartIce();
      }
      const offer = await pc.createOffer({ iceRestart: true });
      await pc.setLocalDescription(offer);
      if (pc.localDescription && currentRoomIdRef.current === roomId) {
        socket.emit('offer', { roomId, sdp: pc.localDescription });
      }
    } catch (err) {
      console.error('[Voxa] Controlled ICE restart failed:', err);
    }
  }, [socket]);

  const logCandidatePairStats = async (pc: RTCPeerConnection) => {
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
              `[Voxa] Connected via ${localCandidate.candidateType || 'unknown'} <-> ${remoteCandidate.candidateType || 'unknown'} (${localCandidate.protocol || 'udp'})`
            );
          }
        }
      });
    } catch {
      // Diagnostic fail silent
    }
  };

  const initPeerConnection = useCallback(async (roomId: string, isPolite: boolean, localStream: MediaStream) => {
    closePeerConnection();

    currentRoomIdRef.current = roomId;
    isPoliteRef.current = isPolite;
    hasRelayCandidateRef.current = false;
    restartCountRef.current = 0;

    const { iceServers, hasTurn } = await getIceServers();

    const pc = new RTCPeerConnection({
      iceServers,
      iceCandidatePoolSize: 0,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    });

    peerConnectionRef.current = pc;
    setConnectionState(pc.connectionState);

    // Create a new MediaStream for remote tracks
    const remoteStreamInstance = new MediaStream();
    setRemoteStream(remoteStreamInstance);

    // 1. Add local media tracks
    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream);
    });

    // 2. Handle incoming remote tracks (Bug #27 fix)
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      } else {
        remoteStreamInstance.addTrack(event.track);
        setRemoteStream(new MediaStream(remoteStreamInstance.getTracks()));
      }
      setConnectionState('connected');
    };

    // 3. ICE candidate trickling & relay candidate detection
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        if (event.candidate.type === 'relay' || (event.candidate.candidate && event.candidate.candidate.includes('typ relay'))) {
          hasRelayCandidateRef.current = true;
        }
        if (currentRoomIdRef.current === roomId) {
          socket.emit('ice_candidate', {
            roomId,
            candidate: event.candidate.toJSON()
          });
        }
      } else {
        // ICE gathering finished
        if (!hasRelayCandidateRef.current && hasTurn) {
          console.warn('[Voxa] ICE gathering finished with NO relay candidate. Check TURN server configuration.');
        }
      }
    };

    // ICE candidate error diagnostics
    pc.onicecandidateerror = (event: any) => {
      if (event.errorCode >= 400 && event.errorCode <= 499) {
        console.debug(`[Voxa] ICE server probe response ${event.errorCode}: ${event.errorText} (${event.url})`);
      }
    };

    // 4. Combined connection state updates for cross-platform/mobile compatibility
    const updateCombinedState = () => {
      if (peerConnectionRef.current !== pc) return;

      const connState = pc.connectionState;
      const iceState = pc.iceConnectionState;

      if (connState === 'connected' || iceState === 'connected' || iceState === 'completed') {
        if (disconnectedTimerRef.current) {
          clearTimeout(disconnectedTimerRef.current);
          disconnectedTimerRef.current = null;
        }
        setConnectionState('connected');
        logCandidatePairStats(pc);
      } else if (connState === 'connecting' || iceState === 'checking') {
        setConnectionState('connecting');
      } else if (connState === 'failed' || iceState === 'failed') {
        if (disconnectedTimerRef.current) {
          clearTimeout(disconnectedTimerRef.current);
          disconnectedTimerRef.current = null;
        }
        setConnectionState('failed');
        triggerIceRestart();
      } else if (connState === 'disconnected' || iceState === 'disconnected') {
        setConnectionState('disconnected');
        if (!disconnectedTimerRef.current) {
          disconnectedTimerRef.current = setTimeout(() => {
            disconnectedTimerRef.current = null;
            if (
              peerConnectionRef.current === pc &&
              (pc.iceConnectionState === 'disconnected' || pc.connectionState === 'disconnected')
            ) {
              console.warn('[Voxa] Connection remained disconnected after 4s grace period. Triggering ICE restart...');
              triggerIceRestart();
            }
          }, 4000);
        }
      } else {
        setConnectionState(connState);
      }
    };

    pc.onconnectionstatechange = updateCombinedState;
    pc.oniceconnectionstatechange = updateCombinedState;

    // 5. WebRTC Perfect Negotiation - onnegotiationneeded
    pc.onnegotiationneeded = async () => {
      try {
        isMakingOfferRef.current = true;
        const offer = await pc.createOffer();
        if (pc.signalingState !== 'stable') return;
        await pc.setLocalDescription(offer);
        if (pc.localDescription && currentRoomIdRef.current === roomId) {
          socket.emit('offer', {
            roomId,
            sdp: pc.localDescription
          });
        }
      } catch (err) {
        console.error('[Voxa] Error during negotiationneeded:', err);
      } finally {
        isMakingOfferRef.current = false;
      }
    };

    // Process socket signaling events
    const handleOffer = async (data: { sdp: RTCSessionDescriptionInit; senderSocketId: string }) => {
      if (peerConnectionRef.current !== pc) return;

      const offerCollision = isMakingOfferRef.current || pc.signalingState !== 'stable';
      isIgnoringOfferRef.current = !isPoliteRef.current && offerCollision;

      if (isIgnoringOfferRef.current) {
        console.log('[Voxa] Impolite peer ignoring offer collision.');
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
        
        // Flush buffered ICE candidates
        while (pendingCandidatesRef.current.length > 0) {
          const cand = pendingCandidatesRef.current.shift();
          if (cand) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch (candErr) {
              console.warn('[Voxa] Error adding buffered candidate:', candErr);
            }
          }
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        if (pc.localDescription && currentRoomIdRef.current === roomId) {
          socket.emit('answer', {
            roomId,
            sdp: pc.localDescription
          });
        }
      } catch (err) {
        console.error('[Voxa] Error handling offer:', err);
      }
    };

    const handleAnswer = async (data: { sdp: RTCSessionDescriptionInit; senderSocketId: string }) => {
      if (peerConnectionRef.current !== pc) return;
      if (pc.signalingState !== 'have-local-offer') {
        console.warn('[Voxa] Ignoring answer received in signalingState:', pc.signalingState);
        return;
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        
        // Flush pending candidates
        while (pendingCandidatesRef.current.length > 0) {
          const cand = pendingCandidatesRef.current.shift();
          if (cand) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch (candErr) {
              console.warn('[Voxa] Error adding pending candidate:', candErr);
            }
          }
        }
      } catch (err) {
        console.error('[Voxa] Error handling answer:', err);
      }
    };

    const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit; senderSocketId: string }) => {
      if (peerConnectionRef.current !== pc) return;
      try {
        if (pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } else {
          // Buffer ICE candidate until remote description is set
          pendingCandidatesRef.current.push(data.candidate);
        }
      } catch (err) {
        if (!isIgnoringOfferRef.current) {
          console.error('[Voxa] Error adding ICE candidate:', err);
        }
      }
    };

    const handlePeerMediaState = (data: PeerMediaState) => {
      setPeerMediaState(data);
    };

    // Clean up any previous signaling listeners before attaching new ones
    if (cleanupSocketListenersRef.current) {
      cleanupSocketListenersRef.current();
    }

    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice_candidate', handleIceCandidate);
    socket.on('peer_media_state', handlePeerMediaState);

    // Store cleanup function for these specific listener references
    cleanupSocketListenersRef.current = () => {
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice_candidate', handleIceCandidate);
      socket.off('peer_media_state', handlePeerMediaState);
    };
  }, [socket, closePeerConnection, triggerIceRestart]);

  useEffect(() => {
    return () => {
      closePeerConnection();
    };
  }, [closePeerConnection]);

  return {
    remoteStream,
    connectionState,
    peerMediaState,
    initPeerConnection,
    closePeerConnection,
    sendMediaState,
    replaceTrack
  };
}
