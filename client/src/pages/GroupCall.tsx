import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMediaStream } from '../hooks/useMediaStream';
import { useGroupWebRTC } from '../hooks/useGroupWebRTC';
import { getSocket } from '../services/socket';
import { GroupVideoGrid } from '../components/GroupVideoGrid';
import { LocalVideo } from '../components/LocalVideo';
import { VideoControls } from '../components/VideoControls';
import { ChatPanel, ChatMessage } from '../components/ChatPanel';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { Toast } from '../components/Toast';
import { copyToClipboard } from '../utils/clipboard';
import {
  ArrowLeft,
  Users,
  Copy,
  Check,
  Video as VideoIcon,
  LogIn,
  Plus,
  ShieldCheck,
  Share2
} from 'lucide-react';

export const GroupCall: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId?: string }>();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Media stream hook
  const {
    localStream,
    cameraOn,
    micOn,
    mediaError,
    requestMediaPermissions,
    toggleCamera,
    toggleMicrophone,
    flipCamera,
    stopMediaStream
  } = useMediaStream();

  // Group WebRTC mesh hook
  const {
    remoteStreams,
    peerConnectionStates,
    peerMediaStates,
    aggregateConnectionState,
    participantCount,
    initGroupCall,
    leaveGroupCall,
    sendMediaState,
    replaceTrackOnAll
  } = useGroupWebRTC();

  // Lobby state
  const [joinInputRoomId, setJoinInputRoomId] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [lobbyError, setLobbyError] = useState<string | null>(null);

  // Active call state
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const socket = getSocket();

  // 1. Initial media permission acquisition
  useEffect(() => {
    requestMediaPermissions();
  }, [requestMediaPermissions]);

  // Sync camera/mic changes to peers
  useEffect(() => {
    if (roomId) {
      sendMediaState(cameraOn, micOn);
    }
  }, [roomId, cameraOn, micOn, sendMediaState]);

  // Auto-clear toast messages
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // 2. Socket handlers for group room lifecycle
  useEffect(() => {
    if (!roomId) return;

    let isSubscribed = true;

    // Wait for media stream to be ready before joining
    const joinWhenReady = async () => {
      let stream = localStream;
      if (!stream) {
        stream = await requestMediaPermissions();
      }
      if (!stream || !isSubscribed) return;

      console.log(`[Voxa Group] Joining room: ${roomId}`);
      socket.emit('join_group', { roomId });
    };

    const handleGroupJoined = (data: { roomId: string; participants: string[]; hostSocketId: string }) => {
      if (!isSubscribed) return;
      console.log(`[Voxa Group] Successfully joined ${data.roomId} with ${data.participants.length} peers`);
      if (localStream) {
        initGroupCall(data.roomId, localStream, data.participants);
      }
    };

    const handleGroupJoinError = (data: { message: string }) => {
      if (!isSubscribed) return;
      setToastMessage(data.message || 'Failed to join group room.');
      setTimeout(() => {
        navigate('/group');
      }, 2500);
    };

    const handleParticipantJoined = (data: { socketId: string }) => {
      setToastMessage(`A new friend joined the call!`);
      setChatMessages(prev => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: 'system',
          text: `Peer joined the call`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    };

    const handleParticipantLeft = (data: { socketId: string; reason?: string }) => {
      setToastMessage(`A participant left the call.`);
      setChatMessages(prev => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: 'system',
          text: `A participant left`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    };

    const handleGroupChatMessage = (data: { senderSocketId: string; text: string; timestamp: number }) => {
      const isSelf = data.senderSocketId === socket.id;
      setChatMessages(prev => [
        ...prev,
        {
          id: `msg-${data.timestamp}-${Math.random()}`,
          sender: isSelf ? 'self' : 'peer',
          text: data.text,
          timestamp: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    };

    socket.on('group_joined', handleGroupJoined);
    socket.on('group_join_error', handleGroupJoinError);
    socket.on('participant_joined', handleParticipantJoined);
    socket.on('participant_left', handleParticipantLeft);
    socket.on('group_chat_message', handleGroupChatMessage);

    joinWhenReady();

    return () => {
      isSubscribed = false;
      socket.off('group_joined', handleGroupJoined);
      socket.off('group_join_error', handleGroupJoinError);
      socket.off('participant_joined', handleParticipantJoined);
      socket.off('participant_left', handleParticipantLeft);
      socket.off('group_chat_message', handleGroupChatMessage);
      leaveGroupCall();
    };
  }, [roomId, localStream, socket, initGroupCall, leaveGroupCall, requestMediaPermissions, navigate]);

  // Lobby actions
  const handleCreateRoom = () => {
    setIsCreatingRoom(true);
    setLobbyError(null);

    const onGroupCreated = (data: { roomId: string }) => {
      socket.off('group_created', onGroupCreated);
      setIsCreatingRoom(false);
      navigate(`/group/${data.roomId}`);
    };

    socket.on('group_created', onGroupCreated);
    socket.emit('create_group', { maxParticipants: 6 });

    // Timeout safety
    setTimeout(() => {
      socket.off('group_created', onGroupCreated);
      setIsCreatingRoom(false);
    }, 5000);
  };

  const handleJoinByInput = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = joinInputRoomId.trim().replace(/^.*\/group\//, '');
    if (!cleanId) {
      setLobbyError('Please enter a valid Room ID or link.');
      return;
    }
    navigate(`/group/${cleanId}`);
  };

  const handleCopyInviteLink = async () => {
    const inviteUrl = `${window.location.origin}/group/${roomId}`;
    const success = await copyToClipboard(inviteUrl);
    if (success) {
      setCopiedLink(true);
      setToastMessage('Group invite link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    } else {
      setToastMessage(`Group Link: ${inviteUrl}`);
    }
  };

  const handleSendChatMessage = (text: string) => {
    if (!roomId) return;
    socket.emit('group_chat_message', { roomId, text });
  };

  const handleFlipCamera = () => {
    flipCamera((newTrack, kind) => {
      replaceTrackOnAll(newTrack, kind);
    });
  };

  const handleExitCall = () => {
    leaveGroupCall();
    stopMediaStream();
    navigate('/');
  };

  // ----------------------------------------------------
  // Render: LOBBY MODE (when no roomId in URL)
  // ----------------------------------------------------
  if (!roomId) {
    return (
      <div className="relative min-h-[100dvh] bg-[#080B11] text-white flex flex-col justify-between overflow-x-hidden p-4 sm:p-6">
        {/* Header */}
        <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2 mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors glass-card px-3 py-2 rounded-xl border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-semibold">Back to Home</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#B8001C] flex items-center justify-center text-white shadow-md">
              <Users className="w-4 h-4" />
            </div>
            <span className="font-heading font-black text-xl tracking-tight text-white">
              VOXA GROUPS
            </span>
          </div>
        </header>

        {/* Center content */}
        <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 my-auto">
          {/* Camera preview card */}
          <div className="w-full lg:w-1/2 flex flex-col items-center">
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-950">
              <LocalVideo
                stream={localStream}
                cameraOn={cameraOn}
                micOn={micOn}
                fullSize
              />
            </div>

            {/* Quick pre-call media toggles */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={toggleMicrophone}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                  micOn
                    ? 'bg-slate-800 text-slate-200 border-white/10 hover:bg-slate-700'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                }`}
              >
                {micOn ? 'Microphone On' : 'Microphone Muted'}
              </button>

              <button
                onClick={toggleCamera}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                  cameraOn
                    ? 'bg-slate-800 text-slate-200 border-white/10 hover:bg-slate-700'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                }`}
              >
                {cameraOn ? 'Camera On' : 'Camera Off'}
              </button>
            </div>
          </div>

          {/* Action options */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <div className="text-left">
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                Mesh Video Calling
              </span>
              <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-white mb-2">
                Group Calls (2–6 Friends)
              </h1>
              <p className="text-slate-400 text-sm">
                Create a private room and share the link with friends, or paste a Room ID to jump straight into an existing call.
              </p>
            </div>

            {lobbyError && (
              <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl">
                {lobbyError}
              </div>
            )}

            {/* Create Room Button */}
            <button
              onClick={handleCreateRoom}
              disabled={isCreatingRoom}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#E60023] to-[#B8001C] hover:from-[#f01435] hover:to-[#cb0424] text-white font-heading font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-red-950/40 transition-transform active:scale-[0.98]"
            >
              <Plus className="w-5 h-5" />
              <span>{isCreatingRoom ? 'Creating Room...' : 'Start New Group Call'}</span>
            </button>

            <div className="flex items-center gap-3 text-slate-600">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">or join existing</span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            {/* Join Room Form */}
            <form onSubmit={handleJoinByInput} className="flex gap-2">
              <input
                type="text"
                placeholder="Paste Room ID or Link..."
                value={joinInputRoomId}
                onChange={(e) => setJoinInputRoomId(e.target.value)}
                className="flex-1 min-h-[48px] bg-slate-900/90 border border-white/10 rounded-xl px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-heading font-bold text-sm flex items-center gap-2 border border-white/10 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Join</span>
              </button>
            </form>
          </div>
        </main>

        <footer className="w-full max-w-5xl mx-auto py-3 text-center text-xs text-slate-500">
          Peer-to-peer encrypted mesh streaming. Up to 6 participants per group room.
        </footer>
      </div>
    );
  }

  // ----------------------------------------------------
  // Render: ACTIVE GROUP CALL MODE
  // ----------------------------------------------------
  return (
    <div
      ref={containerRef}
      className="relative w-full h-[100dvh] max-h-[100dvh] bg-[#080B11] flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Top Header Bar */}
      <header className="z-20 w-full px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between glass-nav border-b border-white/5 shrink-0">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={handleExitCall}
            aria-label="Exit group call"
            className="p-2 sm:p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl glass-card hover:bg-white/10 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#B8001C] flex items-center justify-center text-white shadow-md shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <span className="font-heading font-black text-xl tracking-tight text-white hidden sm:inline">
              VOXA
            </span>
          </div>

          {/* Room ID Pill with 1-click copy */}
          <button
            onClick={handleCopyInviteLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-xs font-mono text-slate-300 transition-colors ml-2"
            title="Click to copy invite link"
          >
            <span className="truncate max-w-[100px] sm:max-w-[140px] font-bold text-white">
              {roomId}
            </span>
            {copiedLink ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
          </button>
        </div>

        {/* Aggregate Connection Status */}
        <div className="flex items-center space-x-3">
          <ConnectionStatus
            state={aggregateConnectionState === 'connected' ? 'connected' : 'connecting'}
            message={aggregateConnectionState === 'connected' ? 'Connected' : 'Connecting...'}
          />

          <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-400 font-sans">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>P2P Mesh</span>
          </div>
        </div>
      </header>

      {/* Main Viewport: Video Grid + Chat Panel */}
      <main className="relative flex-1 min-h-0 w-full p-2 sm:p-3 md:p-4 flex items-stretch overflow-hidden gap-2 sm:gap-3">
        {/* Left / Center: Group Video Grid */}
        <div className="relative flex-1 min-w-0 h-full rounded-2xl sm:rounded-3xl overflow-hidden flex items-center justify-center bg-slate-950 border border-white/10 shadow-2xl">
          <GroupVideoGrid
            roomId={roomId}
            remoteStreams={remoteStreams}
            peerMediaStates={peerMediaStates}
            peerConnectionStates={peerConnectionStates}
            localStream={localStream}
            localCameraOn={cameraOn}
            localMicOn={micOn}
            onCopyInvite={handleCopyInviteLink}
          />

          {/* Error Alert Box */}
          {mediaError && (
            <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-30 max-w-md w-[calc(100%-2rem)] px-2">
              <div className="bg-rose-950/90 border border-rose-500/40 text-rose-200 p-3 sm:p-4 rounded-2xl shadow-2xl flex items-start space-x-3 backdrop-blur-md">
                <div className="text-xs sm:text-sm">
                  <div className="font-bold mb-0.5">Media Access Error</div>
                  <div>{mediaError}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Desktop Permanent Chat Panel */}
        <div className="hidden md:block w-72 lg:w-80 h-full shrink-0">
          <ChatPanel
            messages={chatMessages}
            onSendMessage={handleSendChatMessage}
            isConnected={true}
            title="Group Chat"
            statusText="Active"
          />
        </div>
      </main>

      {/* Bottom Video Controls */}
      <footer className="z-20 w-full px-3 py-2 sm:py-3 shrink-0">
        <VideoControls
          cameraOn={cameraOn}
          micOn={micOn}
          onToggleCamera={toggleCamera}
          onToggleMicrophone={toggleMicrophone}
          onFlipCamera={handleFlipCamera}
          onEnd={handleExitCall}
          onToggleMobileChat={() => setIsMobileChatOpen(!isMobileChatOpen)}
          containerRef={containerRef}
          onCopyInvite={handleCopyInviteLink}
          hideNextButton={true}
        />
      </footer>

      {/* Mobile Chat Drawer */}
      {isMobileChatOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex flex-col justify-end p-2 animate-in fade-in duration-200">
          <div className="w-full h-[75vh] max-h-[600px] rounded-3xl overflow-hidden shadow-2xl">
            <ChatPanel
              messages={chatMessages}
              onSendMessage={handleSendChatMessage}
              isConnected={true}
              onCloseMobile={() => setIsMobileChatOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Global Toast Alerts */}
      {toastMessage && (
        <Toast
          message={toastMessage}
        />
      )}
    </div>
  );
};
