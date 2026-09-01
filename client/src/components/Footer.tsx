import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 py-8 sm:py-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand Info */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#B8001C] flex items-center justify-center border border-red-700/40 shadow-sm shrink-0">
              <svg 
                className="w-5 h-5 text-white" 
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
            <span className="font-extrabold text-white tracking-tight font-heading text-lg">VOXA</span>
          </div>
          <p className="text-xs text-slate-400 max-w-sm text-center md:text-left">
            Spontaneous face-to-face video connections around the world. No signups, no hassle.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 text-xs font-medium">
          <Link to="/safety" className="min-h-[44px] flex items-center hover:text-white transition-colors gap-1.5 px-1">
            <Shield className="w-3.5 h-3.5 text-[#B8001C]" /> Safety Center
          </Link>
          <Link to="/privacy" className="min-h-[44px] flex items-center hover:text-white transition-colors gap-1.5 px-1">
            <Lock className="w-3.5 h-3.5 text-slate-400" /> Privacy Policy
          </Link>
          <Link to="/terms" className="min-h-[44px] flex items-center hover:text-white transition-colors px-1">
            Terms of Service
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-xs text-slate-500 text-center md:text-right">
          <span>&copy; {new Date().getFullYear()} Voxa Inc. Built for spontaneous connections.</span>
        </div>
      </div>
    </footer>
  );
};
