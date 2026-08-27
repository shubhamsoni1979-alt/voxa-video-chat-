import { Router, Request, Response } from 'express';
import { config } from '../config/env';

const router = Router();

export interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

const DEFAULT_STUN_SERVERS: IceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' }
];

// In-memory cache for Metered credentials
let cachedMeteredResponse: { iceServers: IceServer[]; expiresAt: number } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

router.get('/ice', async (_req: Request, res: Response) => {
  try {
    const iceServers: IceServer[] = [...DEFAULT_STUN_SERVERS];
    let hasTurn = false;

    // 1. Prefer Metered ephemeral TURN credentials when configured
    if (config.meteredApiKey && config.meteredAppName) {
      const now = Date.now();
      if (cachedMeteredResponse && cachedMeteredResponse.expiresAt > now) {
        return res.json({
          iceServers: [...DEFAULT_STUN_SERVERS, ...cachedMeteredResponse.iceServers],
          hasTurn: true
        });
      }

      try {
        const meteredUrl = `https://${config.meteredAppName}.metered.live/api/v1/turn/credentials?apiKey=${config.meteredApiKey}`;
        const response = await fetch(meteredUrl);
        if (response.ok) {
          const meteredServers = (await response.json()) as IceServer[];
          if (Array.isArray(meteredServers) && meteredServers.length > 0) {
            cachedMeteredResponse = {
              iceServers: meteredServers,
              expiresAt: now + CACHE_TTL_MS
            };
            return res.json({
              iceServers: [...DEFAULT_STUN_SERVERS, ...meteredServers],
              hasTurn: true
            });
          }
        } else {
          console.warn('[Voxa Server] Failed to fetch credentials from Metered API, HTTP status:', response.status);
        }
      } catch (err) {
        console.warn('[Voxa Server] Error fetching credentials from Metered API:', (err as Error).message);
      }
    }

    // 2. Static TURN configuration fallback
    if (config.turnUrls && config.turnUsername && config.turnCredential) {
      const turnUrlsArray = config.turnUrls.includes(',')
        ? config.turnUrls.split(',').map((url) => url.trim()).filter(Boolean)
        : [config.turnUrls.trim()];

      if (turnUrlsArray.length > 0) {
        iceServers.push({
          urls: turnUrlsArray,
          username: config.turnUsername,
          credential: config.turnCredential
        });
        hasTurn = true;
      }
    }

    return res.json({
      iceServers,
      hasTurn
    });
  } catch (error) {
    console.error('[Voxa Server] ICE route internal error:', error);
    return res.status(500).json({
      iceServers: DEFAULT_STUN_SERVERS,
      hasTurn: false
    });
  }
});

export default router;
