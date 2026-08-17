import React from 'react';

export const MarqueeBanner: React.FC = () => {
  const marqueeItems = [
    "🎬 VOXA LIVE VIDEO CHAT",
    "⚡ SPONTANEOUS FACE-TO-FACE MATCHING",
    "⚡ SUB-50MS INSTANT MATCHING",
    "🌐 CONNECT ACROSS THE GLOBE",
    "🔒 ZERO SIGNUP REQUIRED",
    "⚡ PRIVATE ENCRYPTED WEBRTC STREAM",
  ];

  return (
    <div className="w-full bg-[#B8001C] text-white py-2.5 overflow-hidden flex items-center shadow-md relative z-20 font-sans border-b border-black/20">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, index) => (
          <div key={index} className="inline-flex items-center space-x-6 mx-4">
            <span className="text-xs font-black tracking-widest uppercase text-white flex items-center gap-2">
              {item}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFC72C]"></span>
          </div>
        ))}
      </div>
    </div>
  );
};
