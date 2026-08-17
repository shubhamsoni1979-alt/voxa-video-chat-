import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, X, Check } from 'lucide-react';
import { UserReportData } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (reportData: UserReportData) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmitReport }) => {
  const [selectedReason, setSelectedReason] = useState<UserReportData['reason']>('inappropriate');
  const [details, setDetails] = useState('');

  const reasons: { id: UserReportData['reason']; label: string; desc: string }[] = [
    { id: 'inappropriate', label: 'Inappropriate Behavior', desc: 'Offensive language or disrespectful conduct' },
    { id: 'nudity', label: 'Nudity / Sexual Content', desc: 'Explicit visual or sexual material' },
    { id: 'harassment', label: 'Harassment or Bullying', desc: 'Threats, stalking, or targeted insults' },
    { id: 'hate', label: 'Hate Speech or Discrimination', desc: 'Racism, hate speech, or bigotry' },
    { id: 'spam', label: 'Spam or Bot Behavior', desc: 'Promoting links, selling products, or automated spam' },
    { id: 'other', label: 'Other Violation', desc: 'Other behavior breaking community guidelines' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReport({
      reason: selectedReason,
      details: details.trim()
    });
    onClose();
  };

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
            className="w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6 relative"
          >
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                <Flag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-outfit text-white">Report & Block User</h3>
                <p className="text-slate-400 text-xs">Help us keep Voxa safe. Reports are strictly confidential.</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Select Reason
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                  {reasons.map((r) => (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      key={r.id}
                      onClick={() => setSelectedReason(r.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        selectedReason === r.id
                          ? 'bg-rose-500/20 border-rose-500 text-white'
                          : 'bg-slate-900/60 border-white/5 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-semibold">{r.label}</div>
                        <div className="text-[11px] text-slate-400">{r.desc}</div>
                      </div>
                      {selectedReason === r.id && (
                        <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Optional Details */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={2}
                  placeholder="Describe what happened..."
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors resize-none"
                />
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/5 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold py-3 rounded-xl shadow-lg shadow-rose-600/20 transition-all"
                >
                  Report & Block
                </motion.button>
              </div>
            </form>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
