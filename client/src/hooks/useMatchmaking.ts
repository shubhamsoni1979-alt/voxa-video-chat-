import { useState, useCallback, useEffect, useRef } from 'react';
import { getSocket } from '../services/socket';
import { useMediaStream } from './useMediaStream';
import { useWebRTC } from './useWebRTC';
import { ConnectionState, MatchData, UserReportData } from '../types';

export function useMatchmaking() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [partnerSocketId, setPartnerSocketId] = useState<string | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {
    localStream,
    cameraOn,
    micOn,
    facingMode,
    mediaError,
    isLoadingMedia,
    requestMediaPermissions,
    toggleCamera,
    toggleMicrophone,
    flipCamera,
    stopMediaStream
  } = useMediaStream();

  const {
    remoteStream,
    connectionState: rtcState,
    peerMediaState,
    initPeerConnection,
    closePeerConnection,
    sendMediaState
  } = useWebRTC();

  const socket = getSocket();
  const matchDataRef = useRef<MatchData | null>(null);

  // Sync camera/mic track changes to remote peer
  useEffect(() => {
    if (connectionState === 'connected' || connectionState === 'connecting') {
      sendMediaState(cameraOn, micOn);
    }
  }, [cameraOn, micOn, connectionState, sendMediaState]);

  // Sync WebRTC connection state to client state
  useEffect(() => {
    if (rtcState === 'connected') {
      setConnectionState('connected');
      setStatusMessage('Connected');
    } else if (rtcState === 'connecting') {
      setConnectionState('connecting');
      setStatusMessage('Establishing video connection...');
    } else if (rtcState === 'failed' || rtcState === 'disconnected') {
      if (connectionState === 'connected' || connectionState === 'connecting') {
        setConnectionState('partner_disconnected');
        setStatusMessage('Connection lost with partner.');
      }
    }
  }, [rtcState]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const startMatchmaking = useCallback(async () => {
    setConnectionState('requesting_media');
    setStatusMessage('Preparing camera & microphone...');

    const stream = await requestMediaPermissions();
    if (!stream) {
      setConnectionState('error');
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    setConnectionState('searching');
    setStatusMessage('Searching for your next conversation...');
    socket.emit('find_match');
  }, [requestMediaPermissions, socket]);

  const nextMatch = useCallback(async () => {
    closePeerConnection();
    setPartnerSocketId(null);
    setCurrentRoomId(null);
    matchDataRef.current = null;

    setConnectionState('searching');
    setStatusMessage('Finding someone new...');

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('next');
  }, [closePeerConnection, socket]);

  const leaveChat = useCallback(() => {
    closePeerConnection();
    stopMediaStream();
    if (socket.connected) {
      socket.emit('leave_room');
    }
    setPartnerSocketId(null);
    setCurrentRoomId(null);
    matchDataRef.current = null;
    setConnectionState('idle');
    setStatusMessage('');
  }, [closePeerConnection, stopMediaStream, socket]);

  const blockPartner = useCallback(() => {
    if (partnerSocketId && currentRoomId) {
      socket.emit('block_user', { targetSocketId: partnerSocketId, roomId: currentRoomId });
      showToast('User blocked. Finding someone new...');
      nextMatch();
    }
  }, [partnerSocketId, currentRoomId, socket, nextMatch]);

  const reportPartner = useCallback(async (reportData: UserReportData) => {
    if (!partnerSocketId) return;

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportedSocketId: partnerSocketId,
          roomId: currentRoomId,
          reason: reportData.reason,
          details: reportData.details
        })
      });

      if (response.ok) {
        showToast('Report submitted. Thank you for keeping Voxa safe.');
        blockPartner();
      } else {
        showToast('Failed to send report. Please try again.');
      }
    } catch (err) {
      showToast('Network error sending report.');
    }
  }, [partnerSocketId, currentRoomId, blockPartner]);

  // Handle Socket.IO Event subscriptions
  useEffect(() => {
    const handleSearchingStatus = (data: { searching: boolean; message: string }) => {
      if (data.searching) {
        setConnectionState('searching');
        setStatusMessage(data.message || 'Searching for your next conversation...');
      }
    };

    const handleMatchFound = async (data: MatchData) => {
      matchDataRef.current = data;
      setPartnerSocketId(data.partnerSocketId);
      setCurrentRoomId(data.roomId);

      setConnectionState('matched');
      setStatusMessage("Someone's here! Connecting video...");

      if (localStream) {
        setConnectionState('connecting');
        await initPeerConnection(data.roomId, data.isPolite, localStream);
      }
    };

    const handlePeerDisconnected = (data: { reason: string }) => {
      closePeerConnection();
      setConnectionState('partner_disconnected');
      if (data.reason === 'blocked') {
        setStatusMessage('Partner blocked.');
      } else {
        setStatusMessage('They left the conversation.');
      }
    };

    const handleErrorMessage = (data: { message: string }) => {
      showToast(data.message);
    };

    socket.on('searching_status', handleSearchingStatus);
    socket.on('match_found', handleMatchFound);
    socket.on('peer_disconnected', handlePeerDisconnected);
    socket.on('error_message', handleErrorMessage);

    return () => {
      socket.off('searching_status', handleSearchingStatus);
      socket.off('match_found', handleMatchFound);
      socket.off('peer_disconnected', handlePeerDisconnected);
      socket.off('error_message', handleErrorMessage);
    };
  }, [socket, localStream, initPeerConnection, closePeerConnection]);

  return {
    connectionState,
    statusMessage,
    localStream,
    remoteStream,
    cameraOn,
    micOn,
    facingMode,
    mediaError,
    isLoadingMedia,
    peerMediaState,
    isReportModalOpen,
    toastMessage,
    setIsReportModalOpen,
    startMatchmaking,
    nextMatch,
    leaveChat,
    toggleCamera,
    toggleMicrophone,
    flipCamera,
    blockPartner,
    reportPartner
  };
}
