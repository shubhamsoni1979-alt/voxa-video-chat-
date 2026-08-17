import React from 'react';
import { ConnectionState } from '../types';
import { Loader2, Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  state: ConnectionState;
  message?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ state, message }) => {
  const getStatusConfig = () => {
    switch (state) {
      case 'searching':
        return {
          label: 'SEARCHING',
          subtext: message || 'Looking for someone new...',
          badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
          dotColor: 'bg-indigo-400 animate-ping',
          icon: Loader2,
          spin: true
        };
      case 'matched':
      case 'connecting':
        return {
          label: 'CONNECTING',
          subtext: message || 'Establishing video stream...',
          badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          dotColor: 'bg-cyan-400 animate-pulse',
          icon: Loader2,
          spin: true
        };
      case 'connected':
        return {
          label: 'CONNECTED',
          subtext: 'Live P2P Connection',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          dotColor: 'bg-emerald-400',
          icon: Wifi,
          spin: false
        };
      case 'partner_disconnected':
        return {
          label: 'PARTNER LEFT',
          subtext: message || 'They left the conversation.',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          dotColor: 'bg-amber-400',
          icon: WifiOff,
          spin: false
        };
      case 'error':
        return {
          label: 'ERROR',
          subtext: message || 'Connection error',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          dotColor: 'bg-rose-400',
          icon: WifiOff,
          spin: false
        };
      default:
        return {
          label: 'IDLE',
          subtext: '',
          badgeBg: 'bg-slate-800 text-slate-400 border-slate-700',
          dotColor: 'bg-slate-500',
          icon: Wifi,
          spin: false
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="flex items-center space-x-2.5 glass-card px-3.5 py-1.5 rounded-full border border-white/10 text-xs shadow-md">
      <span className={`w-2 h-2 rounded-full ${config.dotColor}`}></span>
      <span className="font-bold tracking-wider font-outfit text-white">{config.label}</span>
      {config.subtext && (
        <span className="hidden sm:inline text-slate-400 border-l border-slate-700 pl-2 font-normal">
          {config.subtext}
        </span>
      )}
    </div>
  );
};
