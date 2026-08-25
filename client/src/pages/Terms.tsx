import React from 'react';
import { Navbar } from '../components/Navbar';
import { MarqueeBanner } from '../components/MarqueeBanner';
import { Footer } from '../components/Footer';
import { FileText, ShieldAlert, CheckCircle } from 'lucide-react';

export const Terms: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Navbar />
      <MarqueeBanner />

      <main className="flex-grow max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#B8001C]">Legal Agreements</span>
          <h1 className="text-4xl font-extrabold font-heading text-slate-900">Voxa Terms of Service</h1>
          <p className="text-slate-600 text-base max-w-xl mx-auto font-sans">
            Please read these terms carefully before participating in Voxa live video chat.
          </p>
        </div>

        <div className="spidey2-card-white p-8 rounded-3xl border border-slate-200 space-y-6 text-sm text-slate-700 leading-relaxed font-sans shadow-lg">
          <section className="space-y-2">
            <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#B8001C]" />
              1. Acceptance of Terms & Age Requirement
            </h2>
            <p>
              By accessing or using Voxa, you affirm that you are at least 18 years of age (or the legal age of majority in your jurisdiction) and fully competent to enter into these terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-slate-900" />
              2. User Conduct & Community Guidelines
            </h2>
            <p>
              You agree not to transmit any unlawful, harassing, abusive, sexually explicit, threatening, or harmful content. Violations will result in an immediate permanent ban.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#B8001C]" />
              3. Service Availability & Modifications
            </h2>
            <p>
              Voxa is provided on an "AS IS" and "AS AVAILABLE" basis. We reserve the right to modify or discontinue any feature of the service at any time without notice.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};
