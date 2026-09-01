import React from 'react';
import { motion } from 'framer-motion';
import { FastForward, Home } from 'lucide-react';

interface PartnerDisconnectedProps {
  onNext: () => void;
  onHome: () => void;
  message?: string;
}

export const PartnerDisconnected: React.FC<PartnerDisconnectedProps> = ({ onNext, onHome, message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/92 backdrop-blur-md p-6 text-center space-y-6 font-sans"
    >
      
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#E60023] via-[#B8001C] to-[#8B0014] text-white border-2 border-white/30 shadow-2xl flex items-center justify-center text-3xl sm:text-4xl"
      >
        <span>👋</span>
      </motion.div>

      <div className="space-y-2 max-w-sm px-2">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading text-white tracking-tight">
          {message || 'They left the conversation!'}
        </h2>
        <p className="text-slate-300 font-sans text-xs sm:text-sm font-medium">
          Don't worry! Click NEXT to immediately match with someone new! 🚀
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center space-y-2.5 sm:space-y-0 sm:space-x-3 w-full max-w-xs px-2">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onNext}
          className="w-full min-h-[44px] spidey2-btn-red text-white text-sm sm:text-base font-extrabold py-3 px-5 sm:py-3.5 sm:px-6 rounded-xl sm:rounded-2xl flex items-center justify-center space-x-2 shadow-lg"
        >
          <FastForward className="w-5 h-5" />
          <span>NEXT PERSON 🚀</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onHome}
          className="w-full min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white border border-white/20 text-xs sm:text-sm font-bold py-3 px-5 sm:py-3.5 sm:px-6 rounded-xl sm:rounded-2xl flex items-center justify-center space-x-2"
        >
          <Home className="w-4 h-4 text-slate-400" />
          <span>Exit to Home 🏠</span>
        </motion.button>
      </div>

    </motion.div>
  );
};
