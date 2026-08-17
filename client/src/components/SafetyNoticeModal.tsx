import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, CheckCircle } from 'lucide-react';

interface SafetyNoticeModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const SafetyNoticeModal: React.FC<SafetyNoticeModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
            className="w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/20 shadow-2xl space-y-6 text-center"
          >
            
            {/* Warning Icon */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400"
            >
              <ShieldAlert className="w-8 h-8" />
            </motion.div>

            {/* Title */}
            <div className="space-y-2">
              <h3 className="text-2xl font-bold font-outfit text-white">Before You Connect</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Random video chat connects you with people you don't know. Never share passwords, financial information, your home address, or other sensitive personal data.
              </p>
            </div>

            {/* Rules List */}
            <div className="bg-slate-900/80 rounded-2xl p-4 text-left text-xs text-slate-300 space-y-2.5 border border-white/10">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Be respectful to strangers.</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Nudity, harassment, and illegal conduct are strictly prohibited.</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />
                <span>You must be at least 18 years old to use Voxa.</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center space-x-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCancel}
                className="flex-1 py-3.5 rounded-xl border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/5 transition-colors"
              >
                Cancel
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onConfirm}
                className="flex-1 gradient-brand-button text-white text-sm font-bold py-3.5 rounded-xl shadow-lg shadow-rose-600/30 transition-all"
              >
                I Understand
              </motion.button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
