import React from 'react';
import { UserX, FastForward, Home } from 'lucide-react';

interface PartnerDisconnectedProps {
  onNext: () => void;
  onHome: () => void;
  message?: string;
}

export const PartnerDisconnected: React.FC<PartnerDisconnectedProps> = ({ onNext, onHome, message }) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 text-center space-y-6 animate-fadeIn">
      
      <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-xl">
        <UserX className="w-10 h-10" />
      </div>

      <div className="space-y-2 max-w-sm">
        <h2 className="text-2xl sm:text-3xl font-extrabold font-outfit text-white">
          {message || 'They left the conversation.'}
        </h2>
        <p className="text-slate-400 text-sm">
          Don't worry! Click below to immediately match with someone new.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full max-w-xs">
        <button
          onClick={onNext}
          className="w-full gradient-brand-button text-white text-base font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center space-x-2 shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <FastForward className="w-5 h-5" />
          <span>NEXT PERSON</span>
        </button>

        <button
          onClick={onHome}
          className="w-full glass-card text-slate-300 text-sm font-semibold py-3.5 px-6 rounded-2xl flex items-center justify-center space-x-2 hover:bg-white/10 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Exit to Home</span>
        </button>
      </div>

    </div>
  );
};
