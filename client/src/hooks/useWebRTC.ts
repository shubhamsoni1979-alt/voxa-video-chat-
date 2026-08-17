import { useState, useCallback, useRef, useEffect } from 'react';
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

  const socket = getSocket();

  const closePeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onicecandidate = null;
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
  }, []);

  const sendMediaState = useCallback((cameraOn: boolean, micOn: boolean) => {
    socket.emit('media_state', { cameraOn, micOn });
  }, [socket]);

  const initPeerConnection = useCallback(async (roomId: string, isPolite: boolean, localStream: MediaStream) => {
    closePeerConnection();

    currentRoomIdRef.current = roomId;
    isPoliteRef.current = isPolite;

    const pc = new RTCPeerConnection({
      iceServers: getIceServers(),
      iceCandidatePoolSize: 10
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

    // 2. Handle incoming remote tracks
    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => {
        remoteStreamInstance.addTrack(track);
      });
      setRemoteStream(new MediaStream(remoteStreamInstance.getTracks()));
    };

    // 3. ICE candidate trickling
    pc.onicecandidate = (event) => {
      if (event.candidate && currentRoomIdRef.current === roomId) {
        socket.emit('ice_candidate', {
          roomId,
          candidate: event.candidate.toJSON()
        });
      }
    };

    // 4. Connection state updates
    pc.onconnectionstatechange = () => {
      if (peerConnectionRef.current === pc) {
        setConnectionState(pc.connectionState);
      }
    };

    // 5. WebRTC Perfect Negotiation - onnegotiationneeded
    pc.onnegotiationneeded = async () => {
      try {
        isMakingOfferRef.current = true;
        await pc.setLocalDescription();
        if (pc.localDescription && currentRoomIdRef.current === roomId) {
          socket.emit('offer', {
            roomId,
            sdp: pc.localDescription
          });
        }
      } catch (err) {
        console.error('Error during negotiationneeded:', err);
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
        return; // Impolite peer ignores offer collision
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        
        // Flush buffered ICE candidates
        while (pendingCandidatesRef.current.length > 0) {
          const cand = pendingCandidatesRef.current.shift();
          if (cand) {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          }
        }

        await pc.setLocalDescription();
        if (pc.localDescription && currentRoomIdRef.current === roomId) {
          socket.emit('answer', {
            roomId,
            sdp: pc.localDescription
          });
        }
      } catch (err) {
        console.error('Error handling offer:', err);
      }
    };

    const handleAnswer = async (data: { sdp: RTCSessionDescriptionInit; senderSocketId: string }) => {
      if (peerConnectionRef.current !== pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        
        // Flush pending candidates
        while (pendingCandidatesRef.current.length > 0) {
          const cand = pendingCandidatesRef.current.shift();
          if (cand) {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          }
        }
      } catch (err) {
        console.error('Error handling answer:', err);
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
          console.error('Error adding ICE candidate:', err);
        }
      }
    };

    const handlePeerMediaState = (data: PeerMediaState) => {
      setPeerMediaState(data);
    };

    // Attach temporary socket listeners for signaling
    socket.off('offer').on('offer', handleOffer);
    socket.off('answer').on('answer', handleAnswer);
    socket.off('ice_candidate').on('ice_candidate', handleIceCandidate);
    socket.off('peer_media_state').on('peer_media_state', handlePeerMediaState);

    // Initial offer kickstart if impolite peer
    if (!isPolite) {
      try {
        isMakingOfferRef.current = true;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', {
          roomId,
          sdp: offer
        });
      } catch (err) {
        console.error('Error creating initial offer:', err);
      } finally {
        isMakingOfferRef.current = false;
      }
    }
  }, [socket, closePeerConnection]);

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
    sendMediaState
  };
}
