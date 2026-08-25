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

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const isCameraDisabled = !peerMediaState.cameraOn;
  const isMicDisabled = !peerMediaState.micOn;

  return (
    <div className="relative w-full h-full bg-[#080C14] flex items-center justify-center overflow-hidden rounded-3xl border border-white/5 shadow-2xl">
      
      {/* Remote Video Element - Mirrored Stream for natural mirror display */}
      {stream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${
            isCameraDisabled ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}

      {/* Camera Off / Waiting Placeholder */}
      {(!stream || isCameraDisabled || !isConnected) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0B0F17] via-[#111726] to-[#0A0E18] space-y-4">
          <div className="relative">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center shadow-xl">
              <User className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400" />
            </div>
            {isCameraDisabled && (
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
                <VideoOff className="w-4 h-4" />
              </div>
            )}
          </div>
          <span className="text-slate-400 text-sm font-medium">
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
        <div className="absolute top-4 left-4 glass-card px-3 py-1.5 rounded-full flex items-center space-x-1.5 text-xs text-amber-300 border border-amber-500/20 shadow-md">
          <MicOff className="w-3.5 h-3.5" />
          <span>Partner muted</span>
        </div>
      )}

    </div>
  );
};
