import React from 'react';
import { ShieldCheck, Lock, Zap, RefreshCw, Sliders, Flag } from 'lucide-react';

export const TrustSafety: React.FC = () => {
  const trustFeatures = [
    {
      title: 'Instant Matching',
      desc: 'Powered by Redis real-time queues. Pairs available users in milliseconds.',
      icon: Zap,
      color: 'text-amber-400'
    },
    {
      title: 'Zero Registration',
      desc: 'No account creation, email confirmation, or profiles required. Complete privacy.',
      icon: Lock,
      color: 'text-cyan-400'
    },
    {
      title: 'Private Peer-to-Peer Video',
      desc: 'Video and audio stream directly between users via encrypted WebRTC. Never saved on servers.',
      icon: ShieldCheck,
      color: 'text-emerald-400'
    },
    {
      title: 'One-Click Next',
      desc: 'Instantly leave any uncomfortable conversation and match with someone new in a fraction of a second.',
      icon: RefreshCw,
      color: 'text-indigo-400'
    },
    {
      title: 'Media Controls',
      desc: 'Full tactile control over your camera, microphone, and device facing mode at any time.',
      icon: Sliders,
      color: 'text-purple-400'
    },
    {
      title: 'Report & Block Tools',
      desc: 'Built-in blocklist and strict violation reporting to immediately ban bad actors.',
      icon: Flag,
      color: 'text-rose-400'
    }
  ];

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">Safety First Infrastructure</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-outfit text-white">Built for Spontaneous Conversations</h2>
          <p className="text-slate-400 text-sm sm:text-base">Designed from the ground up with user protection, privacy, and speed as core tenets.</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustFeatures.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                className="glass-card rounded-2xl p-6 border border-white/5 hover:border-indigo-500/30 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                  <Icon className={`w-6 h-6 ${feat.color}`} />
                </div>
                <h3 className="text-lg font-bold font-outfit text-white mb-2">{feat.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
