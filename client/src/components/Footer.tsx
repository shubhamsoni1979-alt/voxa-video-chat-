import React from 'react';
import { Link } from 'react-router-dom';
import { Video, Heart, Shield, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#080B11] py-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand Info */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg gradient-brand-button flex items-center justify-center">
              <Video className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight font-outfit text-base">VOXA</span>
          </div>
          <p className="text-xs text-slate-500 max-w-sm text-center md:text-left">
            Spontaneous face-to-face video connections around the world. No signups, no hassle.
          </p>
        </div>

        {/* Links */}
        <div className="flex items-center space-x-6 text-xs font-medium">
          <Link to="/safety" className="hover:text-white transition-colors flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-indigo-400" /> Safety Center
          </Link>
          <Link to="/privacy" className="hover:text-white transition-colors flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-cyan-400" /> Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-xs text-slate-500 flex items-center gap-1">
          <span>&copy; {new Date().getFullYear()} Voxa Inc. Built for spontaneous connections.</span>
        </div>
      </div>
    </footer>
  );
};
