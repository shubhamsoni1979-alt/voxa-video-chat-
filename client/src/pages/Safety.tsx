import React from 'react';
import { Navbar } from '../components/Navbar';
import { MarqueeBanner } from '../components/MarqueeBanner';
import { Footer } from '../components/Footer';
import { ShieldCheck, Lock, Flag, AlertTriangle, EyeOff, UserCheck } from 'lucide-react';

export const Safety: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Navbar />
      <MarqueeBanner />

      <main className="flex-grow max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#B8001C]">Safety & Trust Center</span>
          <h1 className="text-4xl font-extrabold font-heading text-slate-900">Voxa Safety Guidelines</h1>
          <p className="text-slate-600 text-base max-w-xl mx-auto font-sans">
            We are dedicated to building a safe, spontaneous, and respectful community for instant live video connections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="spidey2-card-white p-6 rounded-3xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#B8001C]/10 border border-[#B8001C]/20 text-[#B8001C] flex items-center justify-center">
              <EyeOff className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-heading text-slate-900">Keep Personal Data Private</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-sans">
              Never share passwords, bank accounts, home addresses, phone numbers, or social security details with people you meet online.
            </p>
          </div>

          <div className="spidey2-card-white p-6 rounded-3xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[#B8001C]" />
            </div>
            <h3 className="text-lg font-bold font-heading text-slate-900">Zero Tolerance Policy</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-sans">
              Harassment, hate speech, bullying, sexual content, nudity, and illegal activities are strictly banned and result in immediate bans.
            </p>
          </div>

          <div className="spidey2-card-white p-6 rounded-3xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#B8001C]/10 border border-[#B8001C]/20 text-[#B8001C] flex items-center justify-center">
              <Flag className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-heading text-slate-900">Instant Report & Block</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-sans">
              Use the flag icon during any conversation to report inappropriate conduct and permanently block that peer from being re-matched.
            </p>
          </div>

          <div className="spidey2-card-white p-6 rounded-3xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold font-heading text-slate-900">Age Requirement</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-sans">
              You must be at least 18 years old (or legal adult age in your jurisdiction) to participate in Voxa video chat.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
