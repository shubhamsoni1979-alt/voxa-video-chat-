import { Router, Request, Response } from 'express';
import { config } from '../config/env';

const router = Router();

export interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

const DEFAULT_STUN_SERVERS: IceServer[] = [
  { urls: 'stun:stun.relay.metered.ca:80' },
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' }
];

// Default fallback Metered TURN configuration
const DEFAULT_METERED_APP_NAME = 'shubhamsoni979';
const DEFAULT_METERED_API_KEY = 'FE0O3raJKACKUl4g08pNkACwVFSCtslK8DqjVOPRytywxuV8';

// In-memory cache for Metered credentials
let cachedMeteredResponse: { iceServers: IceServer[]; expiresAt: number } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

router.get('/ice', async (_req: Request, res: Response) => {
  try {
    const meteredAppName = config.meteredAppName || DEFAULT_METERED_APP_NAME;
    const meteredApiKey = config.meteredApiKey || DEFAULT_METERED_API_KEY;

    const now = Date.now();
    if (cachedMeteredResponse && cachedMeteredResponse.expiresAt > now) {
      return res.json({
        iceServers: [...DEFAULT_STUN_SERVERS, ...cachedMeteredResponse.iceServers],
        hasTurn: true
      });
    }

    // Try fetching dynamically from Metered API
    try {
      const meteredUrl = `https://${meteredAppName}.metered.live/api/v1/turn/credentials?apiKey=${meteredApiKey}`;
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
      }
    } catch (err) {
      console.warn('[Voxa Server] Error fetching credentials from Metered API:', (err as Error).message);
    }

    // Construct standard Metered global TURN server candidate set
    // global.relay.metered.ca is the production endpoint; openrelay.metered.ca
    // is a shared public demo server that rate-limits and rejects allocations under load.
    const fallbackMeteredServers: IceServer[] = [
      {
        urls: 'turn:global.relay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:global.relay.metered.ca:80?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:global.relay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:global.relay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turns:global.relay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ];

    cachedMeteredResponse = {
      iceServers: fallbackMeteredServers,
      expiresAt: now + CACHE_TTL_MS
    };

    return res.json({
      iceServers: [...DEFAULT_STUN_SERVERS, ...fallbackMeteredServers],
      hasTurn: true
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
