import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatchmaking } from '../hooks/useMatchmaking';
import { RemoteVideo } from '../components/RemoteVideo';
import { LocalVideo } from '../components/LocalVideo';
import { VideoControls } from '../components/VideoControls';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { MatchmakingScreen } from '../components/MatchmakingScreen';
import { PartnerDisconnected } from '../components/PartnerDisconnected';
import { ChatPanel } from '../components/ChatPanel';
import { ReportModal } from '../components/ReportModal';
import { Toast } from '../components/Toast';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const VideoChat: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  const {
    connectionState,
    statusMessage,
    localStream,
    remoteStream,
    cameraOn,
    micOn,
    mediaError,
    peerMediaState,
    isReportModalOpen,
    toastMessage,
    chatMessages,
    sendMessage,
    setIsReportModalOpen,
    startMatchmaking,
    nextMatch,
    leaveChat,
    toggleCamera,
    toggleMicrophone,
    flipCamera,
    reportPartner
  } = useMatchmaking();

  // Auto start matchmaking on mount, cleanup on unmount
  // Refs ensure latest callbacks are used without re-triggering the effect
  const startMatchmakingRef = useRef(startMatchmaking);
  startMatchmakingRef.current = startMatchmaking;
  const leaveChatRef = useRef(leaveChat);
  leaveChatRef.current = leaveChat;

  useEffect(() => {
    startMatchmakingRef.current();
    return () => {
      leaveChatRef.current();
    };
  }, []);

  const handleExit = () => {
    leaveChat();
    navigate('/');
  };

  const isConnected = connectionState === 'connected';

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[100dvh] max-h-[100dvh] bg-[#080B11] flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Top Header Bar */}
      <header className="z-20 w-full px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between glass-nav border-b border-white/5 shrink-0">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={handleExit}
            aria-label="Exit chat"
            className="p-2 sm:p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl glass-card hover:bg-white/10 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Voxa Red V Badge Logo */}
            <div className="w-8 h-8 rounded-xl bg-[#B8001C] flex items-center justify-center text-white shadow-md border border-red-700/40 shrink-0">
              <svg 
                className="w-5 h-5" 
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M25 35 L50 68 L75 35" 
                  stroke="currentColor" 
                  strokeWidth="12" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </div>
            <span className="font-heading font-black text-xl tracking-tight text-white hidden sm:inline">
              VOXA
            </span>
          </div>
        </div>

        {/* Connection Status Pill */}
        <ConnectionStatus state={connectionState} message={statusMessage} />

        {/* Privacy Note Badge */}
        <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-400 font-sans">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Encrypted P2P Stream</span>
        </div>
      </header>

      {/* Main Viewport Grid: Video Viewport + Static Permanent Text Chat Panel */}
      <main className="relative flex-1 min-h-0 w-full p-2 sm:p-3 md:p-4 flex items-stretch overflow-hidden gap-2 sm:gap-3">
        
        {/* Left Side: Flexible Video Viewport Area */}
        <div className="relative flex-1 min-w-0 h-full rounded-2xl sm:rounded-3xl overflow-hidden flex items-center justify-center bg-slate-950 border border-white/10 shadow-2xl">
          
          {/* Remote Video Container */}
          <RemoteVideo
            stream={remoteStream}
            peerMediaState={peerMediaState}
            isConnected={isConnected}
          />

          {/* Floating PiP Local Video Preview */}
          {localStream && (
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20">
              <LocalVideo
                stream={localStream}
                cameraOn={cameraOn}
                micOn={micOn}
              />
            </div>
          )}

          {/* Overlay: Searching State */}
          {(connectionState === 'searching' || connectionState === 'requesting_media') && (
            <MatchmakingScreen
              statusMessage={statusMessage}
              onCancel={handleExit}
            />
          )}

          {/* Overlay: Partner Disconnected */}
          {connectionState === 'partner_disconnected' && (
            <PartnerDisconnected
              onNext={nextMatch}
              onHome={handleExit}
              message={statusMessage}
            />
          )}

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

        {/* Right Side: PERMANENT & STATIC Text Chat Panel (Desktop/Tablet) */}
        <div className="hidden md:flex w-[320px] lg:w-[360px] xl:w-[380px] shrink-0 h-full z-20">
          <ChatPanel
            messages={chatMessages}
            onSendMessage={sendMessage}
            isConnected={isConnected}
          />
        </div>

      </main>

      {/* Mobile Chat Modal Drawer (dvh-based) */}
      {isMobileChatOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end">
          <div className="w-full h-[80dvh] max-h-[85dvh] bg-slate-900 rounded-t-3xl p-3 sm:p-4 flex flex-col relative border-t border-white/10 shadow-2xl">
            <button
              onClick={() => setIsMobileChatOpen(false)}
              aria-label="Close chat"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/10 transition-colors"
            >
              ✕
            </button>
            <div className="flex-1 min-h-0 pt-4">
              <ChatPanel
                messages={chatMessages}
                onSendMessage={sendMessage}
                isConnected={isConnected}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <footer className="z-20 w-full p-2 sm:p-3 md:p-4 shrink-0">
        <VideoControls
          cameraOn={cameraOn}
          micOn={micOn}
          onToggleCamera={toggleCamera}
          onToggleMicrophone={toggleMicrophone}
          onFlipCamera={flipCamera}
          onNext={nextMatch}
          onEnd={handleExit}
          onReport={() => setIsReportModalOpen(true)}
          onToggleMobileChat={() => setIsMobileChatOpen(!isMobileChatOpen)}
          containerRef={containerRef}
        />
      </footer>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitReport={reportPartner}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} />

    </div>
  );
};
