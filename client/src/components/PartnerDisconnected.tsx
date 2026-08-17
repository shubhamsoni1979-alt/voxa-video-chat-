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
        className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#E60023] via-[#B8001C] to-[#8B0014] text-white border-2 border-white/30 shadow-2xl flex items-center justify-center text-4xl"
      >
        <span>👋</span>
      </motion.div>

      <div className="space-y-2 max-w-sm">
        <h2 className="text-3xl sm:text-4xl font-black font-heading text-white tracking-tight">
          {message || 'They left the conversation!'}
        </h2>
        <p className="text-slate-300 font-sans text-sm font-medium">
          Don't worry! Click NEXT to immediately match with someone new! 🚀
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full max-w-xs">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onNext}
          className="w-full spidey2-btn-red text-white text-base font-extrabold py-3.5 px-6 rounded-2xl flex items-center justify-center space-x-2 shadow-lg"
        >
          <FastForward className="w-5 h-5" />
          <span>NEXT PERSON 🚀</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onHome}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white border border-white/20 text-sm font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center space-x-2"
        >
          <Home className="w-4 h-4 text-slate-400" />
          <span>Exit to Home 🏠</span>
        </motion.button>
      </div>

    </motion.div>
  );
};
