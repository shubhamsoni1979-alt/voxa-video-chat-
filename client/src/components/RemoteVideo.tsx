import React, { useRef, useEffect } from 'react';
import { User, VideoOff, MicOff } from 'lucide-react';
import { PeerMediaState } from '../types';

interface RemoteVideoProps {
  stream: MediaStream | null;
  peerMediaState: PeerMediaState;
  isConnected: boolean;
  compact?: boolean;
  label?: string;
  onTap?: () => void;
  isPinned?: boolean;
}

export const RemoteVideo: React.FC<RemoteVideoProps> = ({
  stream,
  peerMediaState,
  isConnected,
  compact = false,
  label,
  onTap,
  isPinned = false
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handlePlayVideo = () => {
    if (onTap) {
      onTap();
    }
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.play().catch((err) => {
        if (err.name !== 'AbortError') {
          console.warn('Remote video play retry warning:', err);
        }
      });
    }
  };

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (stream) {
      if (videoEl.srcObject !== stream) {
        videoEl.srcObject = stream;
      }
      
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err.name !== 'AbortError') {
            console.warn('Remote video autoplay blocked by browser policy:', err);
          }
        });
      }
    } else {
      videoEl.srcObject = null;
    }
  }, [stream]);

  const isCameraDisabled = !peerMediaState.cameraOn;
  const isMicDisabled = !peerMediaState.micOn;
  const showVideo = Boolean(stream) && !isCameraDisabled && isConnected;

  return (
    <div
      onClick={handlePlayVideo}
      className={`relative w-full h-full bg-[#080C14] flex items-center justify-center overflow-hidden border border-white/5 shadow-2xl cursor-pointer ${
        compact ? 'rounded-2xl' : 'rounded-3xl'
      } ${isPinned ? 'ring-2 ring-indigo-500' : ''}`}
    >
      
      {/* Remote Video Element - ALWAYS MOUNTED to prevent DOM unmount AbortErrors */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          showVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Camera Off / Waiting Placeholder */}
      {(!stream || isCameraDisabled || !isConnected) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0B0F17] via-[#111726] to-[#0A0E18] p-3 space-y-2 sm:space-y-3 pointer-events-none">
          <div className="relative">
            <div className={`${compact ? 'w-14 h-14 sm:w-16 sm:h-16' : 'w-20 h-20 sm:w-28 md:w-32'} rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center shadow-xl`}>
              <User className={`${compact ? 'w-7 h-7 sm:w-8 sm:h-8' : 'w-10 h-10 sm:w-14 sm:h-14'} text-slate-400`} />
            </div>
            {isCameraDisabled && isConnected && (
              <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
                <VideoOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
            )}
          </div>
          <span className="text-slate-400 text-xs sm:text-sm font-medium text-center max-w-[220px] sm:max-w-none">
            {!isConnected 
              ? "Connecting..." 
              : isCameraDisabled 
                ? "Camera off" 
                : "Waiting for stream..."}
          </span>
        </div>
      )}

      {/* Mic Muted Overlay Indicator for Remote Peer */}
      {isConnected && isMicDisabled && (
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 glass-card px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex items-center space-x-1.5 text-[10px] sm:text-xs text-amber-300 border border-amber-500/20 shadow-md pointer-events-none">
          <MicOff className="w-3 h-3" />
          <span>Muted</span>
        </div>
      )}

      {/* Participant Label Badge */}
      {label && (
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 glass-card px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs text-white/90 font-medium border border-white/10 pointer-events-none flex items-center space-x-1.5 backdrop-blur-md shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="truncate max-w-[120px]">{label}</span>
        </div>
      )}

    </div>
  );
};
