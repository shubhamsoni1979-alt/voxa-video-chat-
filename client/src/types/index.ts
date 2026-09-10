export type ConnectionState = 
  | 'idle'
  | 'requesting_media'
  | 'searching'
  | 'matched'
  | 'connecting'
  | 'connected'
  | 'partner_disconnected'
  | 'error';

export interface PeerMediaState {
  cameraOn: boolean;
  micOn: boolean;
}

export interface MatchData {
  roomId: string;
  partnerSocketId: string;
  isPolite: boolean;
}

export interface UserReportData {
  reason: 'inappropriate' | 'harassment' | 'nudity' | 'hate' | 'spam' | 'other';
  details?: string;
}

export interface GroupRoomData {
  roomId: string;
  participants: string[];
  hostSocketId?: string;
}

export interface GroupPeerMediaState extends PeerMediaState {
  socketId: string;
}

export type GroupConnectionState =
  | 'idle'
  | 'requesting_media'
  | 'lobby'
  | 'joining'
  | 'connected'
  | 'error';

export interface GroupChatMessage {
  id: string;
  senderSocketId: string;
  text: string;
  timestamp: number;
}

