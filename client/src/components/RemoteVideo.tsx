import React, { useRef, useEffect } from 'react';
import { User, VideoOff, MicOff } from 'lucide-react';
import { PeerMediaState } from '../types';

interface RemoteVideoProps {
  stream: MediaStream | null;
  peerMediaState: PeerMediaState;
  isConnected: boolean;
}

export const RemoteVideo: React.FC<RemoteVideoProps> = ({ stream, peerMediaState, isConnected }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handlePlayVideo = () => {
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
      className="relative w-full h-full bg-[#080C14] flex items-center justify-center overflow-hidden rounded-3xl border border-white/5 shadow-2xl cursor-pointer"
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0B0F17] via-[#111726] to-[#0A0E18] p-4 space-y-3 sm:space-y-4 pointer-events-none">
          <div className="relative">
            <div className="w-20 h-20 sm:w-28 md:w-32 rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center shadow-xl">
              <User className="w-10 h-10 sm:w-14 sm:h-14 text-slate-400" />
            </div>
            {isCameraDisabled && isConnected && (
              <div className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
                <VideoOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            )}
          </div>
          <span className="text-slate-400 text-xs sm:text-sm font-medium text-center max-w-[260px] sm:max-w-none">
            {!isConnected 
              ? "Connecting media..." 
              : isCameraDisabled 
                ? "Partner turned off camera" 
                : "Waiting for partner video stream..."}
          </span>
        </div>
      )}

      {/* Mic Muted Overlay Indicator for Remote Peer */}
      {isConnected && isMicDisabled && (
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 glass-card px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center space-x-1.5 text-[11px] sm:text-xs text-amber-300 border border-amber-500/20 shadow-md pointer-events-none">
          <MicOff className="w-3.5 h-3.5" />
          <span>Partner muted</span>
        </div>
      )}

    </div>
  );
};
