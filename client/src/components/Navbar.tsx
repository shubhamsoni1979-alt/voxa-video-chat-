import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, LogIn, User, LogOut, Settings, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useSocketStatus } from '../hooks/useSocketStatus';
import { useAuth, UserProfile } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginModal } from './LoginModal';

interface NavbarProps {
  onStartClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const navigate = useNavigate();
  const { isConnected } = useSocketStatus();
  const { user, isLoggedIn, isLoginModalOpen, openLoginModal, closeLoginModal, login, logout, pendingRedirect } = useAuth();
  
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLoginSuccess = (userData: UserProfile) => {
    login(userData);
    if (pendingRedirect) {
      navigate(pendingRedirect);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full spidey2-nav transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Voxa Signature Red 'V' Badge Logo */}
        <Link to="/" className="flex items-center space-x-3 group focus:outline-none rounded-xl p-1">
          <motion.div
            whileHover={{ scale: 1.05, rotate: [-2, 2, 0] }}
            className="w-10 h-10 rounded-xl bg-[#B8001C] shadow-md flex items-center justify-center border border-red-700/40 shrink-0"
          >
            <svg 
              className="w-6 h-6 text-white" 
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
          </motion.div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-2xl tracking-tight text-slate-900 flex items-center gap-1">
                VOXA
              </span>
              
              {/* Dynamic Connection Indicator */}
              <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-800">
                <span
                  className={`inline-block w-2 h-2 rounded-full transition-all duration-300 ${
                    isConnected
                      ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                      : 'bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse'
                  }`}
                ></span>
                <span>{isConnected ? 'Server Online' : 'Server Offline'}</span>
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-extrabold font-sans">
              Instant Face-to-Face Chat
            </span>
          </div>
        </Link>

        {/* Center Voxa Menu Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-bold text-slate-700">
          <Link to="/" className="hover:text-[#B8001C] transition-colors">Home</Link>
          <a href="#how-it-works" className="hover:text-[#B8001C] transition-colors">How It Works</a>
          <Link to="/safety" className="hover:text-[#B8001C] transition-colors flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#B8001C]" /> Safety
          </Link>
          <Link to="/privacy" className="hover:text-[#B8001C] transition-colors flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-slate-500" /> Privacy
          </Link>
        </nav>

        {/* Right Header Action: Login or Profile Avatar */}
        <div className="relative">
          {isLoggedIn && user ? (
            /* Logged In: Profile Icon Avatar with Dropdown */
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 font-sans transition-all focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-[#B8001C] text-white font-bold flex items-center justify-center text-xs shadow-sm overflow-hidden relative">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.name.charAt(0).toUpperCase()}</span>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                </div>
                <span className="text-xs font-extrabold max-w-[100px] truncate hidden sm:inline-block">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </motion.button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl p-2 border border-slate-200 shadow-2xl z-50 text-slate-800 font-sans space-y-1"
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-black text-slate-900 truncate">{user.name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      </div>
                      <span className="text-[11px] text-slate-400 block truncate">{user.email}</span>
                    </div>

                    <button
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>Account Settings</span>
                    </button>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold rounded-xl hover:bg-rose-50 text-rose-600 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Logged Out: Login Button */
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => openLoginModal()}
              className="spidey2-btn-black text-white text-sm font-bold px-6 py-2.5 rounded-full flex items-center space-x-2 shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </motion.button>
          )}
        </div>

      </div>

      {/* Global Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </header>
  );
};
