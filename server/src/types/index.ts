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

  // Group call events
  group_created: (data: { roomId: string }) => void;
  group_joined: (data: { roomId: string; participants: string[]; hostSocketId: string }) => void;
  group_join_error: (data: { message: string }) => void;
  participant_joined: (data: { socketId: string }) => void;
  participant_left: (data: { socketId: string; reason?: string }) => void;
  group_full: (data: { message: string }) => void;
  group_offer: (data: { sdp: RTCSessionDescriptionInit; senderSocketId: string }) => void;
  group_answer: (data: { sdp: RTCSessionDescriptionInit; senderSocketId: string }) => void;
  group_ice_candidate: (data: { candidate: RTCIceCandidateInit; senderSocketId: string }) => void;
  group_peer_media_state: (data: { socketId: string; cameraOn: boolean; micOn: boolean }) => void;
  group_chat_message: (data: { senderSocketId: string; text: string; timestamp: number }) => void;
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

  // Group call events
  create_group: (data?: { maxParticipants?: number }) => void;
  join_group: (data: { roomId: string }) => void;
  leave_group: (data: { roomId: string }) => void;
  group_offer: (data: { roomId: string; targetSocketId: string; sdp: RTCSessionDescriptionInit }) => void;
  group_answer: (data: { roomId: string; targetSocketId: string; sdp: RTCSessionDescriptionInit }) => void;
  group_ice_candidate: (data: { roomId: string; targetSocketId: string; candidate: RTCIceCandidateInit }) => void;
  group_media_state: (data: { roomId: string; cameraOn: boolean; micOn: boolean }) => void;
  group_chat_message: (data: { roomId: string; text: string }) => void;
}

export interface GroupRoomState {
  roomId: string;
  hostSocketId: string;
  participants: string[]; // ordered by join time, max 6
  createdAt: number;
  maxParticipants: number; // default 6
}

export interface GroupSignalingPayload {
  roomId: string;
  targetSocketId: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

