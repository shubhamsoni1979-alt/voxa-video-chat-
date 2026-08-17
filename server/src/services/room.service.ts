import { v4 as uuidv4 } from 'uuid';
import { redisService } from './redis.service';
import { RoomState, UserSession } from '../types';
import { logger } from '../utils/logger';

class RoomService {
  async createRoom(socketIdA: string, socketIdB: string): Promise<RoomState> {
    const roomId = `room_${uuidv4()}`;
    const room: RoomState = {
      roomId,
      userA: socketIdA,
      userB: socketIdB,
      createdAt: Date.now()
    };

    await redisService.createRoom(room);

    // Update user sessions with currentRoomId
    const sessionA = await redisService.getSession(socketIdA);
    if (sessionA) {
      sessionA.currentRoomId = roomId;
      await redisService.setSession(sessionA);
    }

    const sessionB = await redisService.getSession(socketIdB);
    if (sessionB) {
      sessionB.currentRoomId = roomId;
      await redisService.setSession(sessionB);
    }

    logger.info(`Room created: ${roomId} between [${socketIdA}] and [${socketIdB}]`);
    return room;
  }

  async getRoom(roomId: string): Promise<RoomState | null> {
    return await redisService.getRoom(roomId);
  }

  async closeRoom(roomId: string): Promise<RoomState | null> {
    const room = await redisService.getRoom(roomId);
    if (!room) return null;

    // Reset currentRoomId in sessions
    const sessionA = await redisService.getSession(room.userA);
    if (sessionA && sessionA.currentRoomId === roomId) {
      sessionA.currentRoomId = null;
      await redisService.setSession(sessionA);
    }

    const sessionB = await redisService.getSession(room.userB);
    if (sessionB && sessionB.currentRoomId === roomId) {
      sessionB.currentRoomId = null;
      await redisService.setSession(sessionB);
    }

    await redisService.deleteRoom(roomId);
    logger.info(`Room closed: ${roomId}`);
    return room;
  }

  async getPartnerSocketId(roomId: string, currentSocketId: string): Promise<string | null> {
    const room = await redisService.getRoom(roomId);
    if (!room) return null;
    if (room.userA === currentSocketId) return room.userB;
    if (room.userB === currentSocketId) return room.userA;
    return null;
  }
}

export const roomService = new RoomService();
