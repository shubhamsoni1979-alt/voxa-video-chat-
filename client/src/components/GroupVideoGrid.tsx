import React, { useState } from 'react';
import { RemoteVideo } from './RemoteVideo';
import { LocalVideo } from './LocalVideo';
import { PeerMediaState } from '../types';
import { Maximize2, Minimize2, Slash } from 'lucide-react';

interface GroupVideoGridProps {
  roomId?: string;
  remoteStreams: Record<string, MediaStream>;
  peerMediaStates: Record<string, PeerMediaState>;
  peerConnectionStates: Record<string, RTCPeerConnectionState>;
  localStream: MediaStream | null;
  localCameraOn: boolean;
  localMicOn: boolean;
  onBlockPeer?: (socketId: string) => void;
  onCopyInvite?: () => void;
}

export const GroupVideoGrid: React.FC<GroupVideoGridProps> = ({
  roomId,
  remoteStreams,
  peerMediaStates,
  peerConnectionStates,
  localStream,
  localCameraOn,
  localMicOn,
  onBlockPeer,
  onCopyInvite
}) => {
  const [pinnedSocketId, setPinnedSocketId] = useState<string | null>(null);
  const [blockedSockets, setBlockedSockets] = useState<Set<string>>(new Set());

  const peerSocketIds = Object.keys(remoteStreams);
  const totalInGrid = peerSocketIds.length + 1; // Peers + Self

  const handleBlockToggle = (socketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBlockedSockets(prev => {
      const next = new Set(prev);
      if (next.has(socketId)) {
        next.delete(socketId);
      } else {
        next.add(socketId);
        if (onBlockPeer) onBlockPeer(socketId);
      }
      return next;
    });
  };

  const togglePin = (socketId: string) => {
    setPinnedSocketId(prev => (prev === socketId ? null : socketId));
  };

  // Determine CSS grid columns based on total participants (including local)
  const getGridClasses = () => {
    if (pinnedSocketId) return 'grid-cols-1';
    switch (totalInGrid) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
      case 4:
        return 'grid-cols-1 sm:grid-cols-2';
      case 5:
      case 6:
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  // ----------------------------------------------------
  // CASE 1: A Tile is Pinned (Focus Mode)
  // ----------------------------------------------------
  if (pinnedSocketId) {
    const isPinnedLocal = pinnedSocketId === 'local';
    const isBlocked = !isPinnedLocal && blockedSockets.has(pinnedSocketId);

    return (
      <div className="relative w-full h-full flex flex-col gap-2.5 p-2 sm:p-3 overflow-hidden">
        {/* Main Pinned Video */}
        <div className="relative flex-1 min-h-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-950">
          {isPinnedLocal ? (
            <LocalVideo
              stream={localStream}
              cameraOn={localCameraOn}
              micOn={localMicOn}
              fullSize
            />
          ) : isBlocked ? (
            <div className="w-full h-full bg-slate-900/95 flex flex-col items-center justify-center text-slate-400 p-4">
              <Slash className="w-10 h-10 text-rose-500 mb-2" />
              <p className="text-sm font-semibold">Participant Hidden</p>
              <button
                onClick={(e) => handleBlockToggle(pinnedSocketId, e)}
                className="mt-3 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-white border border-white/10"
              >
                Unhide
              </button>
            </div>
          ) : (
            <RemoteVideo
              stream={remoteStreams[pinnedSocketId]}
              peerMediaState={peerMediaStates[pinnedSocketId] || { cameraOn: true, micOn: true }}
              isConnected={peerConnectionStates[pinnedSocketId] === 'connected'}
              label={`Peer (${pinnedSocketId.slice(0, 5)})`}
              isPinned
            />
          )}

          <button
            onClick={() => setPinnedSocketId(null)}
            className="absolute top-3 right-3 glass-card p-2 rounded-xl text-white/80 hover:text-white border border-white/10 shadow-lg hover:scale-105 transition-all z-20"
            title="Unpin"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Thumbnail Strip at Bottom */}
        <div className="h-24 sm:h-28 flex gap-2 overflow-x-auto pb-1 items-center shrink-0 custom-scrollbar">
          {/* Local Video Thumbnail */}
          {pinnedSocketId !== 'local' && (
            <div
              onClick={() => setPinnedSocketId('local')}
              className="relative w-36 h-full rounded-xl overflow-hidden border border-white/15 cursor-pointer shrink-0 hover:ring-2 hover:ring-indigo-500 transition-all shadow-md"
            >
              <LocalVideo
                stream={localStream}
                cameraOn={localCameraOn}
                micOn={localMicOn}
                fullSize
              />
            </div>
          )}

          {/* Peer Thumbnails */}
          {peerSocketIds.map((sId, idx) => {
            if (sId === pinnedSocketId) return null;
            return (
              <div
                key={sId}
                onClick={() => setPinnedSocketId(sId)}
                className="relative w-36 h-full rounded-xl overflow-hidden border border-white/15 cursor-pointer shrink-0 hover:ring-2 hover:ring-indigo-500 transition-all shadow-md"
              >
                <RemoteVideo
                  stream={remoteStreams[sId]}
                  peerMediaState={peerMediaStates[sId] || { cameraOn: true, micOn: true }}
                  isConnected={peerConnectionStates[sId] === 'connected'}
                  compact
                  label={`Peer ${idx + 1}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Active Video Grid (1–6 Participants)
  // ----------------------------------------------------
  return (
    <div className={`w-full h-full grid ${getGridClasses()} gap-2 sm:gap-3 p-2 sm:p-3 auto-rows-fr overflow-hidden`}>
      {/* 1. Local Video Tile in Grid */}
      <div className="relative w-full h-full min-h-[140px] sm:min-h-[180px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-white/10 group bg-slate-950">
        <LocalVideo
          stream={localStream}
          cameraOn={localCameraOn}
          micOn={localMicOn}
          fullSize
        />
        <button
          onClick={() => togglePin('local')}
          className="absolute top-2 right-2 glass-card p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 border border-white/10 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
          title="Pin to Focus"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Remote Peer Video Tiles */}
      {peerSocketIds.map((sId, index) => {
        const isBlocked = blockedSockets.has(sId);
        return (
          <div
            key={sId}
            className="relative w-full h-full min-h-[140px] sm:min-h-[180px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-white/10 group bg-slate-950"
          >
            {isBlocked ? (
              <div className="w-full h-full bg-slate-900/95 flex flex-col items-center justify-center text-slate-400 p-4">
                <Slash className="w-8 h-8 text-rose-500 mb-2" />
                <p className="text-xs sm:text-sm font-semibold">Participant Hidden</p>
                <button
                  onClick={(e) => handleBlockToggle(sId, e)}
                  className="mt-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] rounded-md text-white border border-white/10"
                >
                  Unhide
                </button>
              </div>
            ) : (
              <>
                <RemoteVideo
                  stream={remoteStreams[sId]}
                  peerMediaState={peerMediaStates[sId] || { cameraOn: true, micOn: true }}
                  isConnected={peerConnectionStates[sId] === 'connected'}
                  compact={totalInGrid > 2}
                  label={`Peer ${index + 1}`}
                  onTap={() => togglePin(sId)}
                />

                {/* Tile Action Controls: Pin & Hide buttons */}
                <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={() => togglePin(sId)}
                    className="glass-card p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 border border-white/10 shadow-md"
                    title="Pin to Focus"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleBlockToggle(sId, e)}
                    className="glass-card p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 border border-rose-500/20 shadow-md"
                    title="Hide Participant"
                  >
                    <Slash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
