
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

// Metered credentials MUST be supplied via environment variables (METERED_APP_NAME, METERED_API_KEY).
// Never hardcode API keys in source code.

// Cache for generated credentials (valid 23h, refresh before expiry)
let cachedCredential: {
  iceServers: IceServer[];
  expiresAt: number;
} | null = null;

// Build TURN server list from a username + password pair on Metered's global relays
function buildMeteredTurnServers(username: string, credential: string): IceServer[] {
  return [
    { urls: 'turn:a.relay.metered.ca:80',             username, credential },
    { urls: 'turn:a.relay.metered.ca:80?transport=tcp', username, credential },
    { urls: 'turn:a.relay.metered.ca:443',             username, credential },
    { urls: 'turn:a.relay.metered.ca:443?transport=tcp', username, credential },
    { urls: 'turns:a.relay.metered.ca:443',            username, credential }
  ];
}

// OpenRelay public fallback — used ONLY when Metered credential generation fails
const OPENRELAY_FALLBACK: IceServer[] = [
  { urls: 'turn:openrelay.metered.ca:80',             username: 'openrelayproject', credential: 'openrelayproject' },
  { urls: 'turn:openrelay.metered.ca:80?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' },
  { urls: 'turn:openrelay.metered.ca:443',            username: 'openrelayproject', credential: 'openrelayproject' },
  { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' }
];

router.get('/ice', async (_req: Request, res: Response) => {
  try {
    const meteredAppName = config.meteredAppName;
    const meteredApiKey  = config.meteredApiKey;

    // If no Metered credentials configured, skip to OpenRelay fallback
    if (!meteredAppName || !meteredApiKey) {
      console.warn('[Voxa Server] No METERED_APP_NAME / METERED_API_KEY configured. Using OpenRelay fallback.');
      return res.json({ iceServers: [...DEFAULT_STUN_SERVERS, ...OPENRELAY_FALLBACK], hasTurn: true });
    }

    const now = Date.now();

    // Return cached credential if still valid (with 5 min safety buffer)
    if (cachedCredential && cachedCredential.expiresAt > now + 5 * 60 * 1000) {
      return res.json({ iceServers: [...DEFAULT_STUN_SERVERS, ...cachedCredential.iceServers], hasTurn: true });
    }

    // Generate a fresh short-lived credential via Metered POST API
    // This works even when no static credentials exist in the dashboard.
    try {
      const postUrl = `https://${meteredAppName}.metered.live/api/v1/turn/credential?secretKey=${meteredApiKey}`;
      const postRes = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: 'voxa-auto', expiryInSeconds: 86400 }) // 24h
      });

      if (postRes.ok) {
        const cred = await postRes.json() as { username?: string; password?: string };
        if (cred.username && cred.password) {
          const turnServers = buildMeteredTurnServers(cred.username, cred.password);
          cachedCredential = {
            iceServers: turnServers,
            expiresAt: now + 23 * 60 * 60 * 1000 // cache 23h (1h before expiry)
          };
          console.log('[Voxa Server] Generated fresh Metered TURN credential:', cred.username);
          return res.json({ iceServers: [...DEFAULT_STUN_SERVERS, ...turnServers], hasTurn: true });
        }
      } else {
        const errBody = await postRes.text();
        console.warn(`[Voxa Server] Metered credential POST failed ${postRes.status}: ${errBody}`);
      }
    } catch (err) {
      console.warn('[Voxa Server] Error calling Metered POST API:', (err as Error).message);
    }

    // Last resort: OpenRelay public server
    console.warn('[Voxa Server] Falling back to OpenRelay public TURN server');
    return res.json({ iceServers: [...DEFAULT_STUN_SERVERS, ...OPENRELAY_FALLBACK], hasTurn: true });

  } catch (error) {
    console.error('[Voxa Server] ICE route internal error:', error);
    return res.status(500).json({ iceServers: DEFAULT_STUN_SERVERS, hasTurn: false });
  }
});

export default router;
