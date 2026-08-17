import React, { useRef, useEffect } from 'react';
import { User, MicOff, VideoOff } from 'lucide-react';

interface LocalVideoProps {
  stream: MediaStream | null;
  cameraOn: boolean;
  micOn: boolean;
}

export const LocalVideo: React.FC<LocalVideoProps> = ({ stream, cameraOn, micOn }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative w-32 sm:w-44 aspect-[4/3] rounded-2xl overflow-hidden glass-card border border-white/20 shadow-2xl transition-all duration-300 group hover:scale-105">
      {/* Video Stream */}
      {stream && cameraOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover transform -scale-x-100" // Mirror local video for natural look
        />
      ) : (
        <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-2 text-slate-400">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-1">
            <User className="w-5 h-5 text-slate-400" />
          </div>
          <span className="text-[10px] font-medium text-slate-400">Camera Off</span>
        </div>
      )}

      {/* Label & Status Indicators */}
      <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] font-semibold text-white pointer-events-none drop-shadow-md">
        <span className="bg-slate-950/60 px-1.5 py-0.5 rounded backdrop-blur-sm">You</span>
        <div className="flex items-center space-x-1">
          {!micOn && (
            <span className="bg-rose-500/80 p-1 rounded-full text-white">
              <MicOff className="w-2.5 h-2.5" />
            </span>
          )}
          {!cameraOn && (
            <span className="bg-amber-500/80 p-1 rounded-full text-white">
              <VideoOff className="w-2.5 h-2.5" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
