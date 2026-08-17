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
