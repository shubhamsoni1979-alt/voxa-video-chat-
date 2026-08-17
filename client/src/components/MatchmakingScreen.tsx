import React from 'react';
import { Search, Sparkles, X } from 'lucide-react';

interface MatchmakingScreenProps {
  statusMessage: string;
  onCancel: () => void;
}

export const MatchmakingScreen: React.FC<MatchmakingScreenProps> = ({ statusMessage, onCancel }) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md p-6 text-center space-y-8 animate-fadeIn">
      
      {/* Animated Radar Ripples */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-40 h-40 rounded-full border border-indigo-500/20 animate-ripple"></div>
        <div className="absolute w-56 h-56 rounded-full border border-cyan-500/10 animate-ripple" style={{ animationDelay: '0.6s' }}></div>
        
        <div className="w-24 h-24 rounded-full gradient-brand-button flex items-center justify-center shadow-2xl shadow-indigo-500/40 relative z-10 animate-pulse-glow">
          <Search className="w-10 h-10 text-white animate-bounce" />
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2 max-w-sm">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span>Voxa Fast Matchmaking</span>
        </div>
        <h2 className="text-2xl font-bold font-outfit text-white">
          {statusMessage || 'Searching for your next conversation...'}
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm">
          Searching for compatible online peers around the world...
        </p>
      </div>

      {/* Cancel Search Button */}
      <button
        onClick={onCancel}
        className="glass-card hover:bg-white/10 text-slate-300 text-sm font-semibold px-6 py-2.5 rounded-full flex items-center space-x-2 border border-white/10 transition-colors"
      >
        <X className="w-4 h-4 text-slate-400" />
        <span>Cancel Search</span>
      </button>

    </div>
  );
};
