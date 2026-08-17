import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ShieldCheck, Lock, Flag, AlertTriangle, EyeOff, UserCheck } from 'lucide-react';

export const Safety: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-200">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Safety & Trust Center</span>
          <h1 className="text-4xl font-extrabold font-outfit text-white">Voxa Safety Guidelines</h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            We are dedicated to building a safe, spontaneous, and respectful community for instant live connections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <EyeOff className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-outfit text-white">Keep Personal Data Private</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Never share passwords, bank accounts, home addresses, phone numbers, or social security details with people you meet online.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-outfit text-white">Zero Tolerance Policy</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Harassment, hate speech, bullying, sexual content, nudity, and illegal activities are strictly banned and result in immediate bans.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Flag className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-outfit text-white">Instant Report & Block</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Use the flag icon during any conversation to report inappropriate conduct and permanently block that peer from being re-matched.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-outfit text-white">Age Requirement</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              You must be at least 18 years old (or legal adult age in your jurisdiction) to participate in Voxa video chat.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
