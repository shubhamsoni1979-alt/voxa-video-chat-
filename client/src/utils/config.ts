const defaultUrl = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000'
  : 'https://voxa-video-chat.onrender.com';

export const API_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL || defaultUrl).replace(/\/$/, '');

export const config = {
  apiUrl: API_URL,
  stunServer: import.meta.env.VITE_STUN_SERVER || 'stun:stun.l.google.com:19302',
  turnServer: import.meta.env.VITE_TURN_SERVER || '',
  turnUsername: import.meta.env.VITE_TURN_USERNAME || '',
  turnPassword: import.meta.env.VITE_TURN_PASSWORD || '',
};

export interface IceConfigResult {
  iceServers: RTCIceServer[];
  hasTurn: boolean;
}

const DEFAULT_STUN_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  { urls: 'stun:stun.services.mozilla.com' },
  { urls: 'stun:global.stun.twilio.com:3478' }
];

let cachedIceResult: { result: IceConfigResult; expiresAt: number } | null = null;
const CLIENT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const getIceServers = async (): Promise<IceConfigResult> => {
  const now = Date.now();
  if (cachedIceResult && cachedIceResult.expiresAt > now) {
    return cachedIceResult.result;
  }

  // Custom TURN configuration from local environment variables if explicitly provided
  if (config.turnServer) {
    const turnUrls = config.turnServer.includes(',')
      ? config.turnServer.split(',').map((s: string) => s.trim())
      : config.turnServer;

    const devResult: IceConfigResult = {
      iceServers: [
        ...DEFAULT_STUN_SERVERS,
        {
          urls: turnUrls,
          username: config.turnUsername,
          credential: config.turnPassword
        }
      ],
      hasTurn: true
    };
    cachedIceResult = { result: devResult, expiresAt: now + CLIENT_CACHE_TTL_MS };
    return devResult;
  }

  try {
    const response = await fetch(`${API_URL}/api/ice`);
    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.iceServers) && data.iceServers.length > 0) {
        const result: IceConfigResult = {
          iceServers: data.iceServers,
          hasTurn: Boolean(data.hasTurn)
        };
        cachedIceResult = { result, expiresAt: now + CLIENT_CACHE_TTL_MS };
        return result;
      }
    }
    console.warn('[Voxa Client] /api/ice returned non-ok or invalid response, falling back to STUN-only.');
  } catch (err) {
    console.warn('[Voxa Client] Failed to fetch /api/ice from backend, falling back to STUN-only:', err);
  }

  const fallbackResult: IceConfigResult = {
    iceServers: DEFAULT_STUN_SERVERS,
    hasTurn: false
  };
  return fallbackResult;
};
