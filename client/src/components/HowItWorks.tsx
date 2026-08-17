import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Search, MessageSquare, FastForward } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Allow camera',
      desc: 'Enable camera and microphone access with a single browser permission prompt.',
      icon: Camera,
      badgeBg: 'bg-[#B8001C] text-white'
    },
    {
      num: '02',
      title: 'Find someone',
      desc: 'Voxa instant matchmaking pairs you with an available online peer in milliseconds.',
      icon: Search,
      badgeBg: 'bg-slate-900 text-white'
    },
    {
      num: '03',
      title: 'Start talking',
      desc: 'Direct encrypted peer-to-peer WebRTC video stream establishes face-to-face chat.',
      icon: MessageSquare,
      badgeBg: 'bg-[#B8001C] text-white'
    },
    {
      num: '04',
      title: 'Skip anytime',
      desc: 'Click NEXT to immediately end current call and join a new conversation instantly.',
      icon: FastForward,
      badgeBg: 'bg-slate-900 text-white'
    }
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-slate-50 relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase font-sans tracking-widest text-[#B8001C] font-bold">
            SIMPLICITY BY DESIGN
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-serifHeading text-slate-900">How Voxa Works</h2>
          <p className="text-slate-600 font-sans text-sm sm:text-base font-normal">No registrations, no profiles. Just real face-to-face fun in 4 steps.</p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={step.num}
                whileHover={{ y: -6 }}
                className="spidey2-card-white rounded-3xl p-6 border border-slate-200 relative flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-serifHeading text-3xl font-black text-slate-300">
                      {step.num}
                    </span>
                    <div className={`w-12 h-12 rounded-2xl ${step.badgeBg} flex items-center justify-center shadow-md`}>
                      <IconComponent className="w-6 h-6 stroke-[2]" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold font-serifHeading text-slate-900">{step.title}</h3>
                  <p className="text-slate-600 font-sans text-sm leading-relaxed">{step.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 text-xs font-sans font-semibold text-slate-400 flex items-center justify-between">
                  <span>Step {step.num} of 04</span>
                  <span className="w-2 h-2 rounded-full bg-[#B8001C]"></span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
