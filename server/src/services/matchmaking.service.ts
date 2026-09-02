import { redisService } from './redis.service';
import { roomService } from './room.service';
import { MatchmakingUser, RoomState } from '../types';
import { logger } from '../utils/logger';

class MatchmakingService {
  async requestMatch(socketId: string): Promise<{ matched: boolean; room?: RoomState; partnerSocketId?: string; isPolite?: boolean }> {
    const session = await redisService.getSession(socketId);
    const userIp = session ? session.ip : 'unknown';
    const blockedSockets = session ? session.blockedSockets : [];
    const blockedIps = session ? session.blockedIps : [];

    // If user is already in a room, leave it first
    if (session && session.currentRoomId) {
      await roomService.closeRoom(session.currentRoomId);
    }

    // Try to find an existing compatible waiting user in queue
    const match = await redisService.findMatchForUser(socketId, userIp, blockedSockets, blockedIps);

    if (match) {
      // Compatibility confirmed! Create a room
      const room = await roomService.createRoom(socketId, match.socketId);
      logger.info(`Match created successfully: [${socketId}] <-> [${match.socketId}]`);

      // User A (socketId) will be impolite (initiates offer), User B (match.socketId) will be polite
      return {
        matched: true,
        room,
        partnerSocketId: match.socketId,
        isPolite: false
      };
    }

    // No compatible user waiting right now. Put user into the queue
    const queueUser: MatchmakingUser = {
      socketId,
      ip: userIp,
      timestamp: Date.now(),
      blockedSockets,
      blockedIps
    };

    await redisService.addToQueue(queueUser);
    logger.info(`User [${socketId}] added to matchmaking queue.`);

    return { matched: false };
  }

  async cancelSearch(socketId: string): Promise<void> {
    await redisService.removeFromQueue(socketId);
    logger.info(`User [${socketId}] cancelled matchmaking search.`);
  }
}

export const matchmakingService = new MatchmakingService();
