import helmet from 'helmet';
import cors from 'cors';
import { config } from '../config/env';

export const corsOptions: cors.CorsOptions = {
  origin: config.clientUrl || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
};

export const helmetMiddleware = helmet({
  contentSecurityPolicy: false, // Managed at frontend level for WebRTC media
  crossOriginResourcePolicy: { policy: 'cross-origin' }
});
