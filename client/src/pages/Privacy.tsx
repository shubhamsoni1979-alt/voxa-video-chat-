import React from 'react';
import { Navbar } from '../components/Navbar';
import { MarqueeBanner } from '../components/MarqueeBanner';
import { Footer } from '../components/Footer';
import { ShieldCheck, Lock, ServerOff, Cpu } from 'lucide-react';

export const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Navbar />
      <MarqueeBanner />

      <main className="flex-grow max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#B8001C]">Data Protection</span>
          <h1 className="text-4xl font-extrabold font-heading text-slate-900">Voxa Privacy Policy</h1>
          <p className="text-slate-600 text-base max-w-xl mx-auto font-sans">
            Your privacy is our highest priority. Learn how our peer-to-peer architecture protects your conversations.
          </p>
        </div>

        <div className="spidey2-card-white p-8 rounded-3xl border border-slate-200 space-y-6 text-sm text-slate-700 leading-relaxed font-sans shadow-lg">
          <section className="space-y-2">
            <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
              <ServerOff className="w-5 h-5 text-[#B8001C]" />
              1. WebRTC Peer-to-Peer Encryption
            </h2>
            <p>
              Voxa does not record, store, transmit, or inspect your video or audio streams. Video and audio flow directly between you and your conversation partner through WebRTC encrypted peer-to-peer connections.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-slate-900" />
              2. Ephemeral Session Data
            </h2>
            <p>
              Our Socket.IO signaling servers only process temporary room setup tokens and ICE connection metadata needed to establish your WebRTC stream. Matchmaking queues are deleted automatically when you disconnect.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#B8001C]" />
              3. Browser Permissions
            </h2>
            <p>
              Camera and microphone permissions are requested by your browser on-demand. You can revoke camera or microphone access at any time through your browser's site permissions settings.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};
