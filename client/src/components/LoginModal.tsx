import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, LogIn, ArrowRight } from 'lucide-react';

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
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl overflow-hidden font-sans my-auto"
        >
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Title */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#B8001C] text-white flex items-center justify-center mx-auto shadow-md">
              <LogIn className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black font-heading text-slate-900">
              {isSignUp ? 'Create Voxa Account' : 'Sign in to Voxa'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Log in with your Google account to start instant video chat
            </p>
          </div>

          {/* Official Google Sign-In Button */}
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSimulatedGoogleLogin}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold flex items-center justify-center space-x-3 border border-slate-300 shadow-sm transition-all"
            >
              {/* Multicolor Official Google 'G' Logo */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </motion.button>

            <div ref={googleBtnRef} className="flex justify-center hidden"></div>
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-semibold">Or use email account</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Display Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#B8001C]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#B8001C]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#B8001C]"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full spidey2-btn-red py-3 rounded-xl text-sm font-extrabold text-white shadow-md flex items-center justify-center space-x-2 mt-2"
            >
              <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </form>

          {/* Switch Tab */}
          <div className="mt-5 text-center text-xs text-slate-500 font-medium">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#B8001C] font-extrabold hover:underline ml-1"
            >
              {isSignUp ? 'Sign In' : 'Create One'}
            </button>
          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};
