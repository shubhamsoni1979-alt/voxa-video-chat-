import React from 'react';
import { ShieldCheck, Lock, Zap, RefreshCw, Sliders, Flag } from 'lucide-react';
import { motion } from 'framer-motion';

export const TrustSafety: React.FC = () => {
  const trustFeatures = [
    {
      title: 'Instant Matching',
      desc: 'Powered by Redis real-time queues. Pairs available users in milliseconds.',
      icon: Zap,
      color: 'text-[#B8001C]'
    },
    {
      title: 'Zero Registration',
      desc: 'No account creation, email confirmation, or profiles required. Complete privacy.',
      icon: Lock,
      color: 'text-slate-900'
    },
    {
      title: 'Private Peer-to-Peer Video',
      desc: 'Video and audio stream directly between users via encrypted WebRTC.',
      icon: ShieldCheck,
      color: 'text-[#B8001C]'
    },
    {
      title: 'One-Click Next',
      desc: 'Instantly leave any uncomfortable conversation and match with someone new.',
      icon: RefreshCw,
      color: 'text-slate-900'
    },
    {
      title: 'Media Controls',
      desc: 'Full tactile control over your camera, microphone, and device facing mode.',
      icon: Sliders,
      color: 'text-[#B8001C]'
    },
    {
      title: 'Report & Block Tools',
      desc: 'Built-in blocklist and strict violation reporting to immediately ban bad actors.',
      icon: Flag,
      color: 'text-slate-900'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase font-sans tracking-widest text-[#B8001C] font-bold">
            SAFETY FIRST INFRASTRUCTURE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black font-serifHeading text-slate-900">
            Built for Spontaneous Connections
          </h2>
          <p className="text-slate-600 font-sans text-sm sm:text-base">Designed from the ground up with user protection, privacy, and speed as core tenets.</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustFeatures.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02, y: -4 }}
                className="spidey2-card-white rounded-3xl p-6 border border-slate-200"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
                  <Icon className={`w-6 h-6 ${feat.color}`} />
                </div>
                <h3 className="text-xl font-bold font-serifHeading text-slate-900 mb-2">{feat.title}</h3>
                <p className="text-slate-600 font-sans text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
