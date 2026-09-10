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
};

export interface IceConfigResult {
  iceServers: RTCIceServer[];
  hasTurn: boolean;
}

const CLOUDFLARE_STUN_FALLBACK: IceConfigResult = {
  iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }],
  hasTurn: false
};

let cachedIceResult: { result: IceConfigResult; expiresAt: number } | null = null;
const CLIENT_CACHE_TTL_MS = 5 * 60 * 1000;

export const getIceServers = async (): Promise<IceConfigResult> => {
  const now = Date.now();
  if (cachedIceResult && cachedIceResult.expiresAt > now) {
    return cachedIceResult.result;
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
  } catch (err) {
    console.warn('[Voxa Client] Failed to fetch /api/ice from backend:', err);
  }

  cachedIceResult = { result: CLOUDFLARE_STUN_FALLBACK, expiresAt: now + CLIENT_CACHE_TTL_MS };
  return CLOUDFLARE_STUN_FALLBACK;
};
