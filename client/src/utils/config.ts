const isLocalHost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  /^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(window.location.hostname) ||
  window.location.hostname.endsWith('.local')
);

const defaultUrl = isLocalHost && typeof window !== 'undefined'
  ? `http://${window.location.hostname}:5000`
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
      if (data && Array.isArray(data.iceServers) && data.iceServers.length > 0 && data.hasTurn) {
        const result: IceConfigResult = {
          iceServers: data.iceServers,
          hasTurn: Boolean(data.hasTurn)
        };
        cachedIceResult = { result, expiresAt: now + CLIENT_CACHE_TTL_MS };
        return result;
      }
    }
  } catch (err) {
    console.warn('[Voxa Client] Failed to fetch /api/ice from backend:', err);
  }

  // Resilient Client Fallback: OpenRelay & Metered TURN Servers (UDP, TCP 443, TLS 443)
  const fallbackResult: IceConfigResult = {
    iceServers: [
      ...DEFAULT_STUN_SERVERS,
      {
        urls: [
          'turn:openrelay.metered.ca:80',
          'turn:openrelay.metered.ca:443',
          'turn:openrelay.metered.ca:443?transport=tcp',
          'turns:openrelay.metered.ca:443'
        ],
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: [
          'turn:shubhamsoni979.metered.live:80',
          'turn:shubhamsoni979.metered.live:443',
          'turn:shubhamsoni979.metered.live:443?transport=tcp',
          'turns:shubhamsoni979.metered.live:443',
          'turns:shubhamsoni979.metered.live:443?transport=tcp'
        ],
        username: 'shubhamsoni979',
        credential: 'FE0O3raJKACKUl4g08pNkACwVFSCtslK8DqjVOPRytywxuV8'
      }
    ],
    hasTurn: true
  };
  cachedIceResult = { result: fallbackResult, expiresAt: now + CLIENT_CACHE_TTL_MS };
  return fallbackResult;
};
