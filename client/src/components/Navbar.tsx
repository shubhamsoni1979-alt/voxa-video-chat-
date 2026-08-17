import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Video, Shield, Lock } from 'lucide-react';

interface NavbarProps {
  onStartClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onStartClick }) => {
  const location = useLocation();
  const isVideoPage = location.pathname === '/chat';

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Wordmark */}
        <Link to="/" className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1">
          <div className="w-10 h-10 rounded-xl gradient-brand-button flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-white font-outfit flex items-center gap-1.5">
              VOXA
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">Instant Connections</span>
          </div>
        </Link>

        {/* Center / Right Links */}
        <nav className="flex items-center space-x-6">
          <Link
            to="/safety"
            className="hidden sm:flex items-center space-x-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200"
          >
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>Safety</span>
          </Link>

          <Link
            to="/privacy"
            className="hidden sm:flex items-center space-x-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200"
          >
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>Privacy</span>
          </Link>

          {!isVideoPage && (
            <Link
              to="/chat"
              onClick={onStartClick}
              className="gradient-brand-button text-white text-sm font-semibold px-5 py-2.5 rounded-full flex items-center space-x-2 shadow-md hover:shadow-indigo-500/25 active:scale-95 transition-all duration-200"
            >
              <Video className="w-4 h-4" />
              <span>Start Video</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
