import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User, LogIn, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userData: { name: string; email: string; avatarUrl?: string }) => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const googleBtnRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (isOpen && window.google?.accounts?.id && googleClientId && googleClientId.includes('.apps.googleusercontent.com')) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response: any) => {
            if (response.credential) {
              try {
                const payload = JSON.parse(atob(response.credential.split('.')[1]));
                onLoginSuccess({
                  name: payload.name || payload.given_name || 'Google User',
                  email: payload.email,
                  avatarUrl: payload.picture
                });
                onClose();
              } catch (err) {
                console.error('Failed to parse Google JWT:', err);
              }
            }
          }
        });

        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: 320,
            text: 'continue_with',
            shape: 'pill'
          });
        }
      } catch (e) {
        console.error('Error initializing Google Auth:', e);
      }
    }
  }, [isOpen, onLoginSuccess, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const displayName = name || email.split('@')[0] || 'Voxa User';
    onLoginSuccess({
      name: displayName,
      email: email,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${displayName}`
    });
    onClose();
  };

  const handleSimulatedGoogleLogin = () => {
    const googleUserNames = ['Alexander Wright', 'Sophia Chen', 'Marcus Vance', 'Olivia Taylor', 'Liam Johnson'];
    const randomName = googleUserNames[Math.floor(Math.random() * googleUserNames.length)];
    const userEmail = `${randomName.toLowerCase().replace(' ', '.')}@gmail.com`;

    onLoginSuccess({
      name: randomName,
      email: userEmail,
      avatarUrl: `https://lh3.googleusercontent.com/a/ACg8oc${Math.random().toString(36).substring(2, 10)}=s96-c`
    });
    onClose();
  };

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
          className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-2xl font-sans my-auto custom-scrollbar"
        >
          {/* Top Close Button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-3 right-3 sm:top-5 sm:right-5 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Title */}
          <div className="text-center space-y-2 mb-5 sm:mb-6">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#B8001C] text-white flex items-center justify-center mx-auto shadow-md">
              <LogIn className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900">
              Sign in to Voxa
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Log in with your Google account to start instant video chat
            </p>
          </div>

          {/* Quick Guest Sign-In Button */}
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSimulatedGoogleLogin}
              className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center space-x-3 border border-slate-300 shadow-sm transition-all"
            >
              {/* Guest / Demo User Icon */}
              <User className="w-5 h-5 text-slate-600" />
              <span>Continue as Guest User</span>
            </motion.button>

            <div ref={googleBtnRef} className="flex justify-center hidden"></div>
          </div>

          {/* Divider */}
          <div className="relative my-4 sm:my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-semibold">Or enter custom display name</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Display Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Your Display Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#B8001C]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email Address (Optional)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#B8001C]"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full min-h-[44px] spidey2-btn-red py-3 rounded-xl text-sm font-extrabold text-white shadow-md flex items-center justify-center space-x-2 mt-2"
            >
              <span>Set Profile & Start</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </form>

          <div className="mt-4 sm:mt-5 text-center text-xs text-slate-500 font-medium">
            No password required — instant display profile setup.
          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};
