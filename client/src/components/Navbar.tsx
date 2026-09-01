import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, LogIn, User, LogOut, Settings, ChevronDown, CheckCircle2, Menu, X } from 'lucide-react';
import { useSocketStatus } from '../hooks/useSocketStatus';
import { useAuth, UserProfile } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginModal } from './LoginModal';

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected } = useSocketStatus();
  const { user, isLoggedIn, isLoginModalOpen, openLoginModal, closeLoginModal, login, logout, pendingRedirect } = useAuth();
  
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  const handleLoginSuccess = (userData: UserProfile) => {
    login(userData);
    if (pendingRedirect) {
      navigate(pendingRedirect);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full spidey2-nav transition-all duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Voxa Signature Red 'V' Badge Logo */}
        <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group focus:outline-none rounded-xl p-1 shrink-0">
          <motion.div
            whileHover={{ scale: 1.05, rotate: [-2, 2, 0] }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#B8001C] shadow-md flex items-center justify-center border border-red-700/40 shrink-0"
          >
            <svg 
              className="w-5 h-5 sm:w-6 sm:h-6 text-white" 
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
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-heading font-black text-xl sm:text-2xl tracking-tight text-slate-900 flex items-center gap-1">
                VOXA
              </span>
              
              {/* Dynamic Connection Indicator */}
              <span className="flex items-center space-x-1.5 px-2 sm:px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-800 shrink-0">
                <span
                  className={`inline-block w-2 h-2 rounded-full transition-all duration-300 ${
                    isConnected
                      ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                      : 'bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse'
                  }`}
                ></span>
                <span className="hidden sm:inline">{isConnected ? 'Server Online' : 'Server Offline'}</span>
              </span>
            </div>
            <span className="hidden sm:block text-[10px] uppercase tracking-widest text-slate-500 font-extrabold font-sans">
              Instant Face-to-Face Chat
            </span>
          </div>
        </Link>

        {/* Center Voxa Menu Links */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 text-sm font-bold text-slate-700">
          <Link to="/" className="hover:text-[#B8001C] transition-colors py-2">Home</Link>
          <a 
            href="#how-it-works" 
            onClick={(e) => {
              const el = document.getElementById('how-it-works');
              if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="hover:text-[#B8001C] transition-colors py-2"
          >
            How It Works
          </a>
          <Link to="/safety" className="hover:text-[#B8001C] transition-colors flex items-center gap-1.5 py-2">
            <Shield className="w-4 h-4 text-[#B8001C]" /> Safety
          </Link>
          <Link to="/privacy" className="hover:text-[#B8001C] transition-colors flex items-center gap-1.5 py-2">
            <Lock className="w-4 h-4 text-slate-500" /> Privacy
          </Link>
        </nav>

        {/* Right Header Action: Login or Profile Avatar + Mobile Toggle */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {isLoggedIn && user ? (
            /* Logged In: Profile Icon Avatar with Dropdown */
            <div className="relative" ref={profileMenuRef}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="min-h-[44px] flex items-center space-x-2 p-1.5 pr-2.5 sm:pr-3 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 font-sans transition-all focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-[#B8001C] text-white font-bold flex items-center justify-center text-xs shadow-sm overflow-hidden relative shrink-0">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.name.charAt(0).toUpperCase()}</span>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                </div>
                <span className="text-xs font-extrabold max-w-[80px] sm:max-w-[100px] truncate hidden xs:inline-block">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              </motion.button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] bg-white rounded-2xl p-2 border border-slate-200 shadow-2xl z-50 text-slate-800 font-sans space-y-1"
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
                      className="w-full min-h-[44px] flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full min-h-[44px] flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
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
                        className="w-full min-h-[44px] flex items-center space-x-2 px-3 py-2 text-xs font-bold rounded-xl hover:bg-rose-50 text-rose-600 transition-colors"
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
              className="spidey2-btn-black text-white text-xs sm:text-sm font-bold min-h-[44px] px-4 py-2 sm:px-6 sm:py-2.5 rounded-full flex items-center space-x-2 shadow-md shrink-0"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </motion.button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2 font-bold text-slate-800"
          >
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="min-h-[44px] flex items-center px-3 py-2 text-sm hover:text-[#B8001C] rounded-xl hover:bg-slate-50 transition-colors"
            >
              Home
            </Link>
            <a
              href="#how-it-works"
              onClick={(e) => {
                setIsMobileMenuOpen(false);
                const el = document.getElementById('how-it-works');
                if (el) {
                  e.preventDefault();
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="min-h-[44px] flex items-center px-3 py-2 text-sm hover:text-[#B8001C] rounded-xl hover:bg-slate-50 transition-colors"
            >
              How It Works
            </a>
            <Link
              to="/safety"
              onClick={() => setIsMobileMenuOpen(false)}
              className="min-h-[44px] flex items-center gap-2 px-3 py-2 text-sm hover:text-[#B8001C] rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Shield className="w-4 h-4 text-[#B8001C]" /> Safety
            </Link>
            <Link
              to="/privacy"
              onClick={() => setIsMobileMenuOpen(false)}
              className="min-h-[44px] flex items-center gap-2 px-3 py-2 text-sm hover:text-[#B8001C] rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Lock className="w-4 h-4 text-slate-500" /> Privacy
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </header>
  );
};
