export interface UserSession {
  socketId: string;
  ip: string;
  joinedAt: number;
  blockedSockets: string[];
  blockedIps: string[];
  currentRoomId: string | null;
  cameraOn: boolean;
  micOn: boolean;
}

export interface MatchmakingUser {
  socketId: string;
  ip: string;
  timestamp: number;
  blockedSockets: string[];
  blockedIps: string[];
}

export interface RoomState {
  roomId: string;
  userA: string;
  userB: string;
  createdAt: number;
}

export interface SignalingPayload {
  roomId: string;
  targetSocketId?: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  mediaState?: {
    cameraOn: boolean;
    micOn: boolean;
  };
}

export interface UserReportPayload {
  reportedSocketId: string;
  roomId: string;
  reason: 'inappropriate' | 'harassment' | 'nudity' | 'hate' | 'spam' | 'other';
  details?: string;
}

export interface ServerToClientEvents {
  match_found: (data: { roomId: string; partnerSocketId: string; isPolite: boolean }) => void;
  searching_status: (data: { searching: boolean; message: string }) => void;
  offer: (data: { sdp: RTCSessionDescriptionInit; senderSocketId: string }) => void;
  answer: (data: { sdp: RTCSessionDescriptionInit; senderSocketId: string }) => void;
  ice_candidate: (data: { candidate: RTCIceCandidateInit; senderSocketId: string }) => void;
  peer_media_state: (data: { cameraOn: boolean; micOn: boolean }) => void;
  peer_disconnected: (data: { reason: string }) => void;
  user_blocked: (data: { blockedSocketId: string }) => void;
  report_received: (data: { success: boolean }) => void;
  error_message: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  find_match: () => void;
  cancel_search: () => void;
  next: () => void;
  offer: (data: { roomId: string; sdp: RTCSessionDescriptionInit }) => void;
  answer: (data: { roomId: string; sdp: RTCSessionDescriptionInit }) => void;
  ice_candidate: (data: { roomId: string; candidate: RTCIceCandidateInit }) => void;
  media_state: (data: { cameraOn: boolean; micOn: boolean }) => void;
  block_user: (data: { targetSocketId: string; roomId: string }) => void;
  leave_room: () => void;
}
