import React from 'react';
import { motion } from 'framer-motion';
import { Video, ArrowRight, Play, ShieldCheck, Zap, Globe, Sparkles, Volume2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeroProps {
  onStartClick: () => void;
  onHowItWorksClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartClick, onHowItWorksClick }) => {
  const { isLoggedIn, openLoginModal } = useAuth();

  const handleStart = () => {
    if (!isLoggedIn) {
      openLoginModal('/chat');
    } else {
      // Delegate to parent (Home) which opens safety modal before navigating
      onStartClick();
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-7rem)] flex items-center overflow-hidden bg-white">
      
      {/* Curved Split Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg
          className="absolute right-0 top-0 h-full w-full lg:w-[56%] text-[#B8001C] preserve-3d"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M 45 0 C 15 35, 55 70, 15 100 L 100 100 L 100 0 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Text Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 flex flex-col items-start text-left space-y-6"
          >
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#B8001C] animate-pulse"></span>
              <span>⚡ INSTANT LIVE MATCHMAKING • 1,420+ ONLINE</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl font-black font-heading text-slate-900 tracking-tight leading-[1.08]">
              Meet someone new. <br />
              <span className="text-[#B8001C]">Right now. 🎬</span>
            </h1>

            {/* Description Subheadline */}
            <p className="text-base sm:text-lg text-slate-700 max-w-xl font-sans leading-relaxed font-medium">
              Jump into a spontaneous face-to-face video conversation with cool strangers from around the world in milliseconds.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center space-y-3.5 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStart}
                className="w-full sm:w-auto spidey2-btn-black text-white text-base font-bold px-8 py-4 rounded-xl flex items-center justify-center space-x-3 shadow-lg"
              >
                <Video className="w-5 h-5" />
                <span>START VIDEO CHAT</span>
                <ArrowRight className="w-4 h-4 opacity-80" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onHowItWorksClick}
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-900 text-base font-semibold px-6 py-4 rounded-xl flex items-center justify-center space-x-2 transition-colors border border-slate-300"
              >
                <Play className="w-4 h-4 fill-slate-800" />
                <span>How It Works</span>
              </motion.button>
            </div>

            {/* Feature Bullets */}
            <div className="pt-4 flex items-center space-x-6 text-xs font-bold text-slate-600">
              <div className="flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-[#B8001C]" />
                <span>Sub-50ms Match</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-slate-900" />
                <span>Private Encrypted P2P</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Globe className="w-4 h-4 text-[#B8001C]" />
                <span>Global Community</span>
              </div>
            </div>

          </motion.div>

          {/* Right Column: Voxa Live Video Showcase Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 relative flex justify-center lg:justify-end"
          >
            {/* Floating Speech Bubble */}
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [-2, 2, -2] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-5 left-4 z-20 bg-[#FFC72C] text-slate-950 font-heading text-xs font-extrabold px-3.5 py-1.5 rounded-full border-2 border-black shadow-lg flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B8001C]" />
              <span>HEY STRANGER! 👋</span>
            </motion.div>

            <div className="w-full max-w-md spidey2-card-dark rounded-3xl p-4 sm:p-5 border-2 border-white/20 shadow-2xl relative overflow-hidden group">
              
              {/* Stream Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-white text-xs font-bold font-sans">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="uppercase tracking-widest text-[#FFC72C] font-extrabold">VOXA LIVE STREAM</span>
                </div>
                <div className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  CONNECTED ⚡
                </div>
              </div>

              {/* Video Mockup Frame */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-white/15 mt-3 shadow-2xl">
                
                {/* Background Cartoon Glow Grid */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#8B0014]/90 via-[#0A0A0A] to-[#B8001C]/90 flex items-center justify-center">
                  
                  {/* Glowing Radar Pulse Rings */}
                  <motion.div
                    animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.6, 0.1, 0.6] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute w-52 h-52 rounded-full border-2 border-[#FFC72C]/40"
                  />
                  <motion.div
                    animate={{ scale: [0.9, 1.8, 0.9], opacity: [0.4, 0.05, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    className="absolute w-72 h-72 rounded-full border-2 border-[#B8001C]/50"
                  />

                  {/* Voxa Official Red V Brand Logo Badge */}
                  <motion.div
                    animate={{ y: [0, -6, 0], scale: [1, 1.04, 1] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative z-10 flex flex-col items-center justify-center space-y-2"
                  >
                    <div className="relative">
                      {/* Voxa Red 'V' Brand Logo Circle */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#B8001C] border-4 border-white/90 shadow-2xl flex items-center justify-center relative overflow-hidden">
                        <svg 
                          className="w-12 h-12 text-white" 
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
                      </div>
                      
                      {/* Online Indicator Badge */}
                      <div className="absolute -bottom-1 -right-1 bg-[#FFC72C] text-slate-950 p-1.5 rounded-full border-2 border-black text-xs font-black shadow-md">
                        ⚡
                      </div>
                    </div>

                    <div className="text-center space-y-0.5">
                      <span className="text-sm font-extrabold text-white tracking-wide block font-heading">
                        Voxa Peer #409
                      </span>
                      <span className="text-[11px] text-slate-300 font-medium bg-black/60 px-2.5 py-0.5 rounded-full border border-white/10 inline-block">
                        📍 New York, USA
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Animated Equalizer Bars */}
                <div className="absolute bottom-3 left-3 flex items-end space-x-1 h-5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
                  <Volume2 className="w-3.5 h-3.5 text-[#FFC72C] mr-1" />
                  <motion.span animate={{ height: ['40%', '100%', '30%', '80%'] }} transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }} className="w-1 bg-[#FFC72C] rounded-full"></motion.span>
                  <motion.span animate={{ height: ['80%', '20%', '90%', '50%'] }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} className="w-1 bg-[#B8001C] rounded-full"></motion.span>
                  <motion.span animate={{ height: ['30%', '90%', '40%', '100%'] }} transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }} className="w-1 bg-emerald-400 rounded-full"></motion.span>
                </div>

                {/* Local User PiP Video Window */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="absolute bottom-3 right-3 w-28 sm:w-32 aspect-video rounded-xl bg-slate-900 border-2 border-white/40 shadow-2xl overflow-hidden flex items-center justify-center bg-cover bg-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 to-rose-950 flex items-center justify-center">
                    <span className="text-2xl animate-bounce">😃</span>
                  </div>
                  <div className="absolute bottom-1 right-1.5 text-[9px] text-white font-bold bg-black/70 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Video className="w-2.5 h-2.5 text-[#B8001C]" /> You
                  </div>
                </motion.div>

              </div>

              {/* Controls Dock */}
              <div className="mt-3.5 py-2 px-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between shadow-md">
                <div className="flex items-center space-x-2">
                  <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white text-xs">🎤</span>
                  <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white text-xs">📹</span>
                </div>
                <div className="spidey2-btn-red px-5 py-2 rounded-full text-xs font-bold text-white shadow-md flex items-center space-x-1.5">
                  <span>NEXT</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
