import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

interface MatchmakingScreenProps {
  statusMessage: string;
  onCancel: () => void;
}

export const MatchmakingScreen: React.FC<MatchmakingScreenProps> = ({ statusMessage, onCancel }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/92 backdrop-blur-md p-6 text-center space-y-8 font-sans"
    >
      
      {/* Animated Radar Ripples */}
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ scale: [0.8, 1.8, 0.8], opacity: [0.8, 0.1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 border-[#B8001C]"
        />
        <motion.div
          animate={{ scale: [0.8, 2.3, 0.8], opacity: [0.6, 0.05, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          className="absolute w-48 h-48 sm:w-60 sm:h-60 rounded-full border-2 border-[#FFC72C]/50"
        />
        
        {/* Voxa Official Red 'V' Brand Logo Badge */}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-[#B8001C] border-2 border-white/30 shadow-2xl flex items-center justify-center relative z-10"
        >
          <svg 
            className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-pulse" 
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
        </motion.div>
      </div>

      {/* Message */}
      <div className="space-y-3 max-w-md px-2">
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#B8001C]/20 text-[#FFC72C] border border-[#B8001C]/50 text-[11px] sm:text-xs font-bold font-sans max-w-full"
        >
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFC72C] animate-spin shrink-0" />
          <span className="truncate">⚡ INSTANT VOXA MATCHING</span>
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight">
          {statusMessage || 'Searching for your next conversation...'}
        </h2>
        
        <p className="text-slate-300 font-sans text-xs sm:text-sm font-medium">
          Connecting with cool strangers across the globe in milliseconds... 🌎
        </p>
      </div>

      {/* Cancel Search Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCancel}
        className="min-h-[44px] px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-extrabold flex items-center space-x-2 border border-white/20 shadow-lg transition-all"
      >
        <X className="w-4 h-4 text-rose-500" />
        <span>Cancel Search 🛑</span>
      </motion.button>

    </motion.div>
  );
};
