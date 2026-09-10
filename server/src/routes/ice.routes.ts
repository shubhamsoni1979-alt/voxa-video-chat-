
import { Router, Request, Response } from 'express';
import { config } from '../config/env';
import { iceRateLimiter } from '../middleware/rateLimiter';
import { logger } from '../utils/logger';

const router = Router();

export interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

const CLOUDFLARE_STUN: IceServer[] = [
  { urls: 'stun:stun.cloudflare.com:3478' }
];

let cachedCredential: {
  iceServers: IceServer[];
  expiresAt: number;
} | null = null;

router.get('/ice', iceRateLimiter, async (_req: Request, res: Response) => {
  try {
    const tokenId = config.cfTurnTokenId;
    const apiToken = config.cfTurnApiToken;

    if (!tokenId || !apiToken) {
      logger.warn('[Voxa Server] No CF_TURN_TOKEN_ID / CF_TURN_API_TOKEN configured. Returning STUN only.');
      return res.json({ iceServers: CLOUDFLARE_STUN, hasTurn: false });
    }

    const now = Date.now();

    if (cachedCredential && cachedCredential.expiresAt > now + 5 * 60 * 1000) {
      return res.json({ iceServers: cachedCredential.iceServers, hasTurn: true });
    }

    try {
      const cfUrl = `https://rtc.live.cloudflare.com/v1/turn/keys/${tokenId}/credentials/generate-ice-servers`;
      const cfRes = await fetch(cfUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ttl: 86400 })
      });

      if (cfRes.ok) {
        const data = await cfRes.json() as { iceServers?: IceServer[] };
        if (data.iceServers && data.iceServers.length > 0) {
          cachedCredential = {
            iceServers: data.iceServers,
            expiresAt: now + 23 * 60 * 60 * 1000
          };
          logger.info('[Voxa Server] Generated fresh Cloudflare TURN credentials.');
          return res.json({ iceServers: data.iceServers, hasTurn: true });
        }
      } else {
        const errBody = await cfRes.text();
        logger.warn(`[Voxa Server] Cloudflare TURN API failed ${cfRes.status}: ${errBody}`);
      }
    } catch (err) {
      logger.warn(`[Voxa Server] Error calling Cloudflare TURN API: ${(err as Error).message}`);
    }

    logger.warn('[Voxa Server] Cloudflare TURN credential generation failed. Returning STUN only.');
    return res.json({ iceServers: CLOUDFLARE_STUN, hasTurn: false });

  } catch (error) {
    logger.error('[Voxa Server] ICE route internal error:', error);
    return res.status(500).json({ iceServers: CLOUDFLARE_STUN, hasTurn: false });
  }
});

export default router;
