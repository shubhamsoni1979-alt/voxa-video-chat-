import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  RefreshCw, 
  Maximize, 
  Minimize, 
  FastForward, 
  PhoneOff, 
  Flag,
  MessageSquare,
  Share2
} from 'lucide-react';

interface VideoControlsProps {
  cameraOn: boolean;
  micOn: boolean;
  onToggleCamera: () => void;
  onToggleMicrophone: () => void;
  onFlipCamera: () => void;
  onNext?: () => void;
  onEnd: () => void;
  onReport?: () => void;
  onToggleMobileChat?: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
  participantCount?: number;
  onCopyInvite?: () => void;
  hideNextButton?: boolean;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  cameraOn,
  micOn,
  onToggleCamera,
  onToggleMicrophone,
  onFlipCamera,
  onNext,
  onEnd,
  onReport,
  onToggleMobileChat,
  containerRef,
  participantCount,
  onCopyInvite,
  hideNextButton = false
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Error attempting to enable fullscreen mode:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  return (
    <div className="w-fit max-w-[96vw] mx-auto glass-dock px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-center gap-2 sm:gap-2.5 shadow-2xl border border-white/10 rounded-2xl sm:rounded-3xl">
      
      {/* Microphone Toggle */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={onToggleMicrophone}
        aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
        title={micOn ? "Mute" : "Unmute"}
        className={`w-10 h-10 sm:w-11 sm:h-11 min-w-[40px] min-h-[40px] rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-200 focus:outline-none shrink-0 ${
          micOn
            ? 'bg-slate-800/90 text-slate-100 hover:bg-slate-700'
            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
        }`}
      >
        {micOn ? <Mic className="w-4 h-4 sm:w-5 sm:h-5" /> : <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />}
      </motion.button>

      {/* Camera Toggle */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={onToggleCamera}
        aria-label={cameraOn ? "Turn off camera" : "Turn on camera"}
        title={cameraOn ? "Turn off camera" : "Turn on camera"}
        className={`w-10 h-10 sm:w-11 sm:h-11 min-w-[40px] min-h-[40px] rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-200 focus:outline-none shrink-0 ${
          cameraOn
            ? 'bg-slate-800/90 text-slate-100 hover:bg-slate-700'
            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
        }`}
      >
        {cameraOn ? <VideoIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" />}
      </motion.button>

      {/* Flip Camera */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={onFlipCamera}
        aria-label="Flip camera"
        title="Switch Camera"
        className="w-10 h-10 sm:w-11 sm:h-11 min-w-[40px] min-h-[40px] rounded-xl sm:rounded-2xl bg-slate-800/90 text-slate-300 hover:bg-slate-700 flex items-center justify-center transition-all duration-200 focus:outline-none shrink-0"
      >
        <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
      </motion.button>

      {/* Fullscreen Toggle (Desktop / Tablet only) */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        title="Toggle Fullscreen"
        className="hidden md:flex w-10 h-10 sm:w-11 sm:h-11 min-w-[40px] min-h-[40px] rounded-xl sm:rounded-2xl bg-slate-800/90 text-slate-300 hover:bg-slate-700 items-center justify-center transition-all duration-200 focus:outline-none shrink-0"
      >
        {isFullscreen ? <Minimize className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />}
      </motion.button>

      {/* Mobile Chat Toggle Button */}
      {onToggleMobileChat && (
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={onToggleMobileChat}
          aria-label="Toggle text chat"
          title="Chat"
          className="md:hidden w-10 h-10 sm:w-11 sm:h-11 min-w-[40px] min-h-[40px] rounded-xl sm:rounded-2xl bg-slate-800/90 text-slate-100 hover:bg-slate-700 flex items-center justify-center transition-all duration-200 focus:outline-none shrink-0"
        >
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.button>
      )}

      {/* Copy Invite Link Button (Group mode) */}
      {onCopyInvite && (
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={onCopyInvite}
          aria-label="Copy group invite link"
          title="Invite Friends"
          className="w-10 h-10 sm:w-11 sm:h-11 min-w-[40px] min-h-[40px] rounded-xl sm:rounded-2xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/40 flex items-center justify-center transition-all duration-200 focus:outline-none shrink-0"
        >
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.button>
      )}

      {/* Report Button (1-to-1 mode) */}
      {onReport && (
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={onReport}
          aria-label="Report or block user"
          title="Report / Block"
          className="w-10 h-10 sm:w-11 sm:h-11 min-w-[40px] min-h-[40px] rounded-xl sm:rounded-2xl bg-slate-800/90 text-amber-400 hover:bg-amber-500/20 border border-transparent flex items-center justify-center transition-all duration-200 focus:outline-none shrink-0"
        >
          <Flag className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.button>
      )}

      {/* Primary Action: NEXT (1-to-1 Mode only) */}
      {!hideNextButton && onNext && (
        <>
          <div className="h-6 w-px bg-white/10 mx-0.5 shrink-0" />
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onNext}
            aria-label="Next user"
            className="spidey2-btn-red text-white text-xs sm:text-sm font-bold min-h-[40px] h-10 sm:h-11 px-4 sm:px-6 rounded-xl sm:rounded-2xl flex items-center justify-center space-x-1.5 shadow-lg transition-all duration-200 font-heading shrink-0"
          >
            <span>NEXT</span>
            <FastForward className="w-4 h-4" />
          </motion.button>
        </>
      )}

      {/* End Call Button */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={onEnd}
        aria-label="End call"
        title="Leave call"
        className="w-10 h-10 sm:w-11 sm:h-11 min-w-[40px] min-h-[40px] rounded-xl sm:rounded-2xl bg-rose-600 text-white hover:bg-rose-700 flex items-center justify-center transition-all duration-200 shadow-md shadow-rose-600/20 focus:outline-none shrink-0"
      >
        <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
      </motion.button>

    </div>
  );
};
