import helmet from 'helmet';
import cors from 'cors';
import { config } from '../config/env';

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowedOrigin = (config.clientUrl || '*').replace(/\/$/, '');

    if (
      allowedOrigin === '*' ||
      origin === allowedOrigin ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
};

export const helmetMiddleware = helmet({
  contentSecurityPolicy: false, // Managed at frontend level for WebRTC media
  crossOriginResourcePolicy: { policy: 'cross-origin' }
});
