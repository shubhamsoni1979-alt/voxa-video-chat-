import React from 'react';
import { Info } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 glass-card bg-slate-900/90 border border-indigo-500/30 text-white text-sm px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2.5 animate-bounce">
      <Info className="w-4 h-4 text-indigo-400 shrink-0" />
      <span>{message}</span>
    </div>
  );
};
