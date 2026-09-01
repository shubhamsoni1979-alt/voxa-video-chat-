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
  MessageSquare
} from 'lucide-react';

interface VideoControlsProps {
  cameraOn: boolean;
  micOn: boolean;
  onToggleCamera: () => void;
  onToggleMicrophone: () => void;
  onFlipCamera: () => void;
  onNext: () => void;
  onEnd: () => void;
  onReport: () => void;
  onToggleMobileChat?: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
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
  containerRef
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
    <div className="w-full max-w-lg sm:w-fit mx-auto glass-dock p-2 sm:p-3 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 shadow-2xl border border-white/10 rounded-2xl">
      
      {/* Row 1 on mobile (<sm) / Left Controls Group on tablet/desktop (sm+) */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-3 w-full sm:w-auto">
        {/* Microphone Toggle */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onToggleMicrophone}
          aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
          className={`w-11 h-11 sm:w-12 sm:h-12 min-w-[44px] min-h-[44px] rounded-2xl flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 shrink-0 ${
            micOn
              ? 'bg-slate-800/90 text-slate-100 hover:bg-slate-700'
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
          }`}
        >
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </motion.button>

        {/* Camera Toggle */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onToggleCamera}
          aria-label={cameraOn ? "Turn off camera" : "Turn on camera"}
          className={`w-11 h-11 sm:w-12 sm:h-12 min-w-[44px] min-h-[44px] rounded-2xl flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 shrink-0 ${
            cameraOn
              ? 'bg-slate-800/90 text-slate-100 hover:bg-slate-700'
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
          }`}
        >
          {cameraOn ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </motion.button>

        {/* Flip Camera (Available on all screens, especially mobile) */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onFlipCamera}
          aria-label="Flip camera"
          className="w-11 h-11 sm:w-12 sm:h-12 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-800/90 text-slate-300 hover:bg-slate-700 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 shrink-0"
        >
          <RefreshCw className="w-5 h-5" />
        </motion.button>

        {/* Fullscreen Toggle (Desktop / Tablet only) */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          className="hidden md:flex w-11 h-11 sm:w-12 sm:h-12 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-800/90 text-slate-300 hover:bg-slate-700 items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 shrink-0"
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </motion.button>

        {/* Mobile Chat Toggle Button */}
        {onToggleMobileChat && (
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={onToggleMobileChat}
            aria-label="Toggle text chat"
            title="Chat"
            className="md:hidden w-11 h-11 sm:w-12 sm:h-12 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-800/90 text-slate-100 hover:bg-slate-700 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 shrink-0"
          >
            <MessageSquare className="w-5 h-5" />
          </motion.button>
        )}

        {/* Report Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onReport}
          aria-label="Report or block user"
          title="Report / Block"
          className="w-11 h-11 sm:w-12 sm:h-12 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-800/90 text-amber-400 hover:bg-amber-500/20 border border-transparent flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 shrink-0"
        >
          <Flag className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Row 2 on mobile (<sm) / Right Action Controls Group on tablet/desktop (sm+) */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto">
        {/* Primary Action: NEXT */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          aria-label="Next user"
          className="spidey2-btn-red text-white text-sm sm:text-base font-bold min-h-[44px] h-11 sm:h-12 px-5 sm:px-7 rounded-2xl flex-1 sm:flex-initial flex items-center justify-center space-x-2 shadow-lg transition-all duration-200 font-heading min-w-[120px] sm:min-w-[130px] shrink-0"
        >
          <span>NEXT</span>
          <FastForward className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.button>

        {/* End Call Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onEnd}
          aria-label="End call"
          title="End conversation"
          className="w-11 h-11 sm:w-12 sm:h-12 min-w-[44px] min-h-[44px] rounded-2xl bg-rose-600 text-white hover:bg-rose-700 flex items-center justify-center transition-all duration-200 shadow-md shadow-rose-600/20 focus:outline-none focus:ring-2 focus:ring-rose-500 shrink-0"
        >
          <PhoneOff className="w-5 h-5" />
        </motion.button>
      </div>

    </div>
  );
};
