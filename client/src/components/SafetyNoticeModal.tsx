import React from 'react';
import { ShieldAlert, CheckCircle } from 'lucide-react';

interface SafetyNoticeModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const SafetyNoticeModal: React.FC<SafetyNoticeModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6 text-center">
        
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold font-outfit text-white">Before You Connect</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Random video chat connects you with people you don't know. Never share passwords, financial information, your home address, or other sensitive personal data.
          </p>
        </div>

        {/* Rules List */}
        <div className="bg-slate-900/60 rounded-2xl p-4 text-left text-xs text-slate-400 space-y-2 border border-white/5">
          <div className="flex items-center space-x-2 text-slate-300">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Be respectful to strangers.</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Nudity, harassment, and illegal conduct are strictly prohibited.</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>You must be at least 18 years old to use Voxa.</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-xl border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 gradient-brand-button text-white text-sm font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
};
