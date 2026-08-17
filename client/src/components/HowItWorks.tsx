import React from 'react';
import { Camera, Search, MessageSquare, FastForward } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Allow camera',
      desc: 'Enable camera and microphone access with a single browser permission prompt.',
      icon: Camera,
      color: 'text-indigo-400',
      bg: 'from-indigo-500/20 to-indigo-500/5'
    },
    {
      num: '02',
      title: 'Find someone',
      desc: 'Voxa instant matchmaking pairs you with an available online peer in milliseconds.',
      icon: Search,
      color: 'text-cyan-400',
      bg: 'from-cyan-500/20 to-cyan-500/5'
    },
    {
      num: '03',
      title: 'Start talking',
      desc: 'Direct encrypted peer-to-peer WebRTC video stream establishes face-to-face chat.',
      icon: MessageSquare,
      color: 'text-emerald-400',
      bg: 'from-emerald-500/20 to-emerald-500/5'
    },
    {
      num: '04',
      title: 'Skip anytime',
      desc: 'Click NEXT to immediately end current call and join a new conversation instantly.',
      icon: FastForward,
      color: 'text-rose-400',
      bg: 'from-rose-500/20 to-rose-500/5'
    }
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-slate-950/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold">Simplicity By Design</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-outfit text-white">How Voxa Works</h2>
          <p className="text-slate-400 text-sm sm:text-base">No registrations, no profiles. Just real conversations in 4 simple steps.</p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.num}
                className="glass-card rounded-3xl p-6 border border-white/5 relative overflow-hidden group hover:border-white/20 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Step Header */}
                  <div className="flex items-center justify-between">
                    <span className="font-outfit text-3xl font-black text-slate-600 group-hover:text-white transition-colors">
                      {step.num}
                    </span>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.bg} flex items-center justify-center`}>
                      <IconComponent className={`w-6 h-6 ${step.color}`} />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold font-outfit text-white">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 text-xs text-slate-500 font-medium flex items-center gap-1">
                  <span>Step {step.num} of 04</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
