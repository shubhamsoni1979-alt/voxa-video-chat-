import helmet from 'helmet';
import cors from 'cors';
import { config } from '../config/env';

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowedOrigin = (config.clientUrl || '').replace(/\/$/, '');

    // Allow exact configured client URL
    if (allowedOrigin && origin === allowedOrigin) {
      return callback(null, true);
    }

    // Allow wildcard ONLY in development mode
    if (config.nodeEnv === 'development' && (allowedOrigin === '*' || !allowedOrigin)) {
      return callback(null, true);
    }

    // Strict URL parsing for localhost & development checks (Bug #5 fix)
    try {
      const parsedUrl = new URL(origin);
      if (
        config.nodeEnv === 'development' &&
        (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1')
      ) {
        return callback(null, true);
      }
    } catch {
      // Invalid URL string
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
};

// WebRTC-compatible Content Security Policy (Bug #7 fix)
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "wss:", "ws:", "https:"],
      mediaSrc: ["'self'", "blob:", "mediastream:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
      frameSrc: ["'self'", "https://accounts.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"]
    }
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' }
});
