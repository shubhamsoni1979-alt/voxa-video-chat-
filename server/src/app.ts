import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config } from './config/env';
import { corsOptions, helmetMiddleware } from './middleware/security';
import { apiRateLimiter } from './middleware/rateLimiter';
import reportRoutes from './routes/report.routes';
import iceRoutes from './routes/ice.routes';
import { registerConnectionHandlers } from './sockets/connection.socket';
import cors from 'cors';

const app = express();

// Security and Parsing Middleware
app.use(helmetMiddleware);
app.use(cors(corsOptions));
app.use(express.json());

// API Rate Limiting & Routes
app.use('/api', apiRateLimiter);
app.use('/api', reportRoutes);
app.use('/api', iceRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString(), env: config.nodeEnv });
});

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO Server
const io = new SocketIOServer(server, {
  cors: corsOptions,
  pingTimeout: 20000,
  pingInterval: 10000,
  transports: ['websocket', 'polling']
});

// Initialize Socket event handlers
registerConnectionHandlers(io);

export { app, server, io };
