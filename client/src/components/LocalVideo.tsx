import React, { useRef, useEffect } from 'react';
import { User, MicOff, VideoOff } from 'lucide-react';

interface LocalVideoProps {
  stream: MediaStream | null;
  cameraOn: boolean;
  micOn: boolean;
  fullSize?: boolean;
  className?: string;
}

export const LocalVideo: React.FC<LocalVideoProps> = ({
  stream,
  cameraOn,
  micOn,
  fullSize = false,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (videoEl && stream) {
      if (videoEl.srcObject !== stream) {
        videoEl.srcObject = stream;
      }
      videoEl.play().catch(() => {});
    }
  }, [stream]);

  const showVideo = Boolean(stream) && cameraOn;

  return (
    <div
      className={
        className
          ? `relative overflow-hidden ${className}`
          : fullSize
          ? 'relative w-full h-full aspect-video rounded-3xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl'
          : 'relative w-28 sm:w-36 md:w-44 aspect-[4/3] rounded-2xl overflow-hidden glass-card border border-white/20 shadow-2xl transition-all duration-300 group hover:scale-105'
      }
    >
      {/* Local Video Stream - Mirrored & Always Mounted */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${
          showVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {!showVideo && (
        <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-3 text-slate-400">
          <div className={`${fullSize ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-10 h-10'} rounded-full bg-slate-800 flex items-center justify-center mb-2 shadow-inner border border-white/5`}>
            <User className={`${fullSize ? 'w-8 h-8 sm:w-10 sm:h-10' : 'w-5 h-5'} text-slate-400`} />
          </div>
          <span className={`${fullSize ? 'text-sm font-semibold' : 'text-[10px] font-medium'} text-slate-400`}>Camera Off</span>
        </div>
      )}

      {/* Label & Status Indicators */}
      <div className={`absolute ${fullSize ? 'bottom-3 left-3 right-3' : 'bottom-1.5 left-2 right-2'} flex items-center justify-between text-xs font-semibold text-white pointer-events-none drop-shadow-md font-sans`}>
        <span className="bg-slate-950/70 px-2 py-0.5 rounded-lg border border-white/10 backdrop-blur-sm text-[11px]">You</span>
        <div className="flex items-center space-x-1.5">
          {!micOn && (
            <span className="bg-rose-500/90 p-1 rounded-full text-white shadow-sm" title="Microphone muted">
              <MicOff className="w-3 h-3" />
            </span>
          )}
          {!cameraOn && (
            <span className="bg-amber-500/90 p-1 rounded-full text-white shadow-sm" title="Camera off">
              <VideoOff className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
