import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  stunServer: process.env.VITE_STUN_SERVER || 'stun:stun.l.google.com:19302',
  turnServer: process.env.VITE_TURN_SERVER || '',
  turnUsername: process.env.VITE_TURN_USERNAME || '',
  turnPassword: process.env.VITE_TURN_PASSWORD || '',
};
