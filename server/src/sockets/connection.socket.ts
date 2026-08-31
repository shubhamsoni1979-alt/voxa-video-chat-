import { Socket, Server } from 'socket.io';
import { redisService } from '../services/redis.service';
import { roomService } from '../services/room.service';
import { clearSocketRateLimit } from '../middleware/rateLimiter';
import { registerMatchmakingHandlers } from './matchmaking.socket';
import { registerSignalingHandlers } from './signaling.socket';
import { logger } from '../utils/logger';
import { UserSession } from '../types';

export function registerConnectionHandlers(io: Server): void {
  io.on('connection', async (socket: Socket) => {
    logger.info(`Socket connected: [${socket.id}]`);

    // Create session
    const session: UserSession = {
      socketId: socket.id,
      joinedAt: Date.now(),
      blockedSockets: [],
      currentRoomId: null,
      cameraOn: true,
      micOn: true
    };

    await redisService.setSession(session);

    // Register event sub-handlers
    registerMatchmakingHandlers(io, socket);
    registerSignalingHandlers(io, socket);

    // Disconnect cleanup
    socket.on('disconnect', async (reason) => {
      logger.info(`Socket disconnected: [${socket.id}] (Reason: ${reason})`);

      // 1. Remove from matchmaking queue if waiting
      await redisService.removeFromQueue(socket.id);

      // 2. Notify partner and close room if in an active room
      const userSession = await redisService.getSession(socket.id);
      if (userSession && userSession.currentRoomId) {
        io.to(userSession.currentRoomId).emit('peer_disconnected', { reason: 'partner_disconnected' });
        await roomService.closeRoom(userSession.currentRoomId);
      }

      // 3. Remove session and clear rate limit tracking
      await redisService.removeSession(socket.id);
      clearSocketRateLimit(socket.id);
    });
  });
}
