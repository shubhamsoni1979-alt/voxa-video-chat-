import { Socket, Server } from 'socket.io';
import { matchmakingService } from '../services/matchmaking.service';
import { roomService } from '../services/room.service';
import { checkSocketRateLimit } from '../middleware/rateLimiter';
import { logger } from '../utils/logger';

export function registerMatchmakingHandlers(io: Server, socket: Socket): void {
  socket.on('find_match', async () => {
    if (!checkSocketRateLimit(socket.id)) {
      socket.emit('error_message', { message: 'Too many match requests. Please slow down.' });
      return;
    }

    try {
      socket.emit('searching_status', { searching: true, message: 'Searching for your next conversation...' });

      const result = await matchmakingService.requestMatch(socket.id);

      if (result.matched && result.room && result.partnerSocketId) {
        const partnerSocket = io.sockets.sockets.get(result.partnerSocketId);

        if (partnerSocket && partnerSocket.connected) {
          // Join socket.io room for both
          socket.join(result.room.roomId);
          partnerSocket.join(result.room.roomId);

          // Notify User A (socket - impolite: false)
          socket.emit('match_found', {
            roomId: result.room.roomId,
            partnerSocketId: result.partnerSocketId,
            isPolite: false
          });

          // Notify User B (partnerSocket - polite: true)
          partnerSocket.emit('match_found', {
            roomId: result.room.roomId,
            partnerSocketId: socket.id,
            isPolite: true
          });

          logger.info(`Match successfully dispatched for room: ${result.room.roomId}`);
        } else {
          // Partner dropped right before matching - cleanup & re-enter queue
          logger.warn(`Partner socket [${result.partnerSocketId}] lost connection during match creation. Searching again.`);
          await roomService.closeRoom(result.room.roomId);
          socket.emit('searching_status', { searching: true, message: 'Finding someone new...' });
          await matchmakingService.requestMatch(socket.id);
        }
      }
    } catch (err: any) {
      logger.error(`Error during find_match for [${socket.id}]:`, err.message);
      socket.emit('error_message', { message: 'Failed to complete matchmaking request.' });
    }
  });

  socket.on('cancel_search', async () => {
    try {
      await matchmakingService.cancelSearch(socket.id);
      socket.emit('searching_status', { searching: false, message: 'Search cancelled.' });
    } catch (err: any) {
      logger.error(`Error during cancel_search for [${socket.id}]:`, err.message);
    }
  });

  socket.on('next', async () => {
    if (!checkSocketRateLimit(socket.id)) return;

    try {
      // Find room socket is currently in and notify partner
      const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
      for (const roomId of rooms) {
        socket.to(roomId).emit('peer_disconnected', { reason: 'partner_next' });
        socket.leave(roomId);
        await roomService.closeRoom(roomId);
      }

      // Immediately trigger find_match
      socket.emit('searching_status', { searching: true, message: 'Finding someone new...' });
      const result = await matchmakingService.requestMatch(socket.id);

      if (result.matched && result.room && result.partnerSocketId) {
        const partnerSocket = io.sockets.sockets.get(result.partnerSocketId);

        if (partnerSocket && partnerSocket.connected) {
          socket.join(result.room.roomId);
          partnerSocket.join(result.room.roomId);

          socket.emit('match_found', {
            roomId: result.room.roomId,
            partnerSocketId: result.partnerSocketId,
            isPolite: false
          });

          partnerSocket.emit('match_found', {
            roomId: result.room.roomId,
            partnerSocketId: socket.id,
            isPolite: true
          });
        }
      }
    } catch (err: any) {
      logger.error(`Error handling next for [${socket.id}]:`, err.message);
    }
  });
}
