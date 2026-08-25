import helmet from 'helmet';
import cors from 'cors';
import { config } from '../config/env';

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or matching CLIENT_URL
    const allowedOrigin = config.clientUrl;
    if (!origin || allowedOrigin === '*' || origin === allowedOrigin) {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy: Request origin not allowed'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
};

export const helmetMiddleware = helmet({
  contentSecurityPolicy: false, // Managed at frontend level for WebRTC media
  crossOriginResourcePolicy: { policy: 'cross-origin' }
});
