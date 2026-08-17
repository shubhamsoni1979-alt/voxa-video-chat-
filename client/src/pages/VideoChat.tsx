import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatchmaking } from '../hooks/useMatchmaking';
import { RemoteVideo } from '../components/RemoteVideo';
import { LocalVideo } from '../components/LocalVideo';
import { VideoControls } from '../components/VideoControls';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { MatchmakingScreen } from '../components/MatchmakingScreen';
import { PartnerDisconnected } from '../components/PartnerDisconnected';
import { ReportModal } from '../components/ReportModal';
import { Toast } from '../components/Toast';
import { Video, ArrowLeft, AlertTriangle, ShieldCheck } from 'lucide-react';

export const VideoChat: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);

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
    setIsReportModalOpen,
    startMatchmaking,
    nextMatch,
    leaveChat,
    toggleCamera,
    toggleMicrophone,
    flipCamera,
    reportPartner
  } = useMatchmaking();

  // Auto start matchmaking on mount
  useEffect(() => {
    startMatchmaking();
    return () => {
      leaveChat();
    };
  }, []);

  const handleExit = () => {
    leaveChat();
    navigate('/');
  };

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen bg-[#080B11] flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Top Header Bar */}
      <header className="z-20 w-full px-4 sm:px-6 py-3 flex items-center justify-between glass-nav border-b border-white/5">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExit}
            aria-label="Exit chat"
            className="p-2 rounded-xl glass-card hover:bg-white/10 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg gradient-brand-button flex items-center justify-center shadow-md">
              <Video className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-lg font-outfit tracking-tight text-white hidden sm:inline">
              VOXA
            </span>
          </div>
        </div>

        {/* Connection Status Pill */}
        <ConnectionStatus state={connectionState} message={statusMessage} />

        {/* Privacy Note Badge */}
        <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Encrypted P2P Stream</span>
        </div>
      </header>

      {/* Main Video Viewport */}
      <main className="relative flex-1 w-full h-full p-2 sm:p-4 flex items-center justify-center overflow-hidden">
        
        {/* Remote Video Container */}
        <RemoteVideo
          stream={remoteStream}
          peerMediaState={peerMediaState}
          isConnected={connectionState === 'connected'}
        />

        {/* Floating PiP Local Video Preview */}
        {localStream && (
          <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-20">
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
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 max-w-md w-full px-4">
            <div className="bg-rose-950/90 border border-rose-500/40 text-rose-200 p-4 rounded-2xl shadow-2xl flex items-start space-x-3 backdrop-blur-md">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <div className="font-bold mb-0.5">Media Access Error</div>
                <div>{mediaError}</div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Bottom Controls Bar */}
      <footer className="z-20 w-full p-3 sm:p-5">
        <VideoControls
          cameraOn={cameraOn}
          micOn={micOn}
          onToggleCamera={toggleCamera}
          onToggleMicrophone={toggleMicrophone}
          onFlipCamera={flipCamera}
          onNext={nextMatch}
          onEnd={handleExit}
          onReport={() => setIsReportModalOpen(true)}
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
