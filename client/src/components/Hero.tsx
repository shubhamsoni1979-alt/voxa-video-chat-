import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Sparkles, ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react';

interface HeroProps {
  onStartClick: () => void;
  onHowItWorksClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartClick, onHowItWorksClick }) => {
  const navigate = useNavigate();

  const handleStart = () => {
    onStartClick();
    navigate('/chat');
  };

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            
            {/* Status Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full glass-card border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Instant P2P Video Matching</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              <span className="text-slate-400 font-normal">Zero Signup Required</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-outfit text-white tracking-tight leading-[1.08]">
              Meet someone new.{' '}
              <span className="gradient-text block mt-1 sm:mt-2">Right now.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
              Jump into a spontaneous face-to-face conversation with someone from around the world in milliseconds.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center space-y-3.5 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <button
                onClick={handleStart}
                className="w-full sm:w-auto gradient-brand-button text-white text-lg font-bold px-8 py-4 rounded-2xl flex items-center justify-center space-x-3 shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all duration-200"
              >
                <Video className="w-6 h-6" />
                <span>START VIDEO CHAT</span>
                <ArrowRight className="w-5 h-5 opacity-80" />
              </button>

              <button
                onClick={onHowItWorksClick}
                className="w-full sm:w-auto glass-card hover:bg-white/10 text-slate-200 text-base font-semibold px-6 py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all duration-200 border border-white/10"
              >
                <span>How It Works</span>
              </button>
            </div>

            {/* Feature Bullets */}
            <div className="pt-4 grid grid-cols-3 gap-4 text-xs font-medium text-slate-400 w-full max-w-lg">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sub-50ms Match</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Private & Encrypted</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Global Community</span>
              </div>
            </div>

          </div>

          {/* Right Visual Preview Mockup */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="w-full max-w-md glass-card rounded-3xl p-3 border border-white/10 shadow-2xl relative overflow-hidden group">
              
              {/* Mock Video Container */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center border border-white/5">
                
                {/* Simulated Remote User Background */}
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/80 via-slate-900 to-cyan-950/80 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-indigo-600/20 border border-indigo-400/30 flex items-center justify-center animate-pulse-glow">
                    <Users className="w-12 h-12 text-indigo-300" />
                  </div>
                </div>

                {/* Simulated Connection Pill */}
                <div className="absolute top-3 left-3 glass-card px-3 py-1 rounded-full flex items-center space-x-2 text-xs font-semibold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>CONNECTED</span>
                </div>

                {/* Simulated Floating PiP Local Camera */}
                <div className="absolute bottom-3 right-3 w-28 aspect-video rounded-xl bg-slate-800 border border-white/20 shadow-lg overflow-hidden flex items-center justify-center">
                  <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <Video className="w-3 h-3 text-indigo-400" /> You
                  </div>
                </div>

              </div>

              {/* Mock Video Controls Dock */}
              <div className="mt-3 py-2 px-4 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-300 text-xs">🎤</span>
                  <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-300 text-xs">📹</span>
                </div>
                <div className="gradient-brand-button px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-md">
                  NEXT ➔
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
