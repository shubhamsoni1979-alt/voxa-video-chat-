import { v4 as uuidv4 } from 'uuid';
import { redisService } from './redis.service';
import { GroupRoomState } from '../types';
import { logger } from '../utils/logger';

class GroupRoomService {
  async createGroupRoom(hostSocketId: string, maxParticipants = 6): Promise<GroupRoomState> {
    // Generate clean, readable room ID
    const roomId = `group_${uuidv4().replace(/-/g, '').slice(0, 10)}`;
    const room: GroupRoomState = {
      roomId,
      hostSocketId,
      participants: [hostSocketId],
      createdAt: Date.now(),
      maxParticipants: Math.min(Math.max(maxParticipants, 2), 6) // clamped between 2 and 6
    };

    await redisService.createGroupRoom(room);

    const session = await redisService.getSession(hostSocketId);
    if (session) {
      session.currentRoomId = roomId;
      await redisService.setSession(session);
    }

    logger.info(`[Voxa Server] Group room created: ${roomId} by host [${hostSocketId}]`);
    return room;
  }

  async getGroupRoom(roomId: string): Promise<GroupRoomState | null> {
    return await redisService.getGroupRoom(roomId);
  }

  async joinGroupRoom(roomId: string, socketId: string): Promise<{ room?: GroupRoomState; error?: string }> {
    const room = await redisService.getGroupRoom(roomId);
    if (!room) {
      return { error: 'Room does not exist or has expired.' };
    }

    if (room.participants.includes(socketId)) {
      return { room };
    }

    if (room.participants.length >= room.maxParticipants) {
      return { error: `Room is full (maximum ${room.maxParticipants} participants).` };
    }

    room.participants.push(socketId);
    await redisService.updateGroupRoom(room);

    const session = await redisService.getSession(socketId);
    if (session) {
      session.currentRoomId = roomId;
      await redisService.setSession(session);
    }

    logger.info(`[Voxa Server] Socket [${socketId}] joined group room ${roomId} (${room.participants.length}/${room.maxParticipants})`);
    return { room };
  }

  async leaveGroupRoom(roomId: string, socketId: string): Promise<{ room: GroupRoomState | null; remainingParticipants: string[] }> {
    const room = await redisService.getGroupRoom(roomId);
    if (!room) {
      return { room: null, remainingParticipants: [] };
    }

    room.participants = room.participants.filter(id => id !== socketId);

    const session = await redisService.getSession(socketId);
    if (session && session.currentRoomId === roomId) {
      session.currentRoomId = null;
      await redisService.setSession(session);
    }

    if (room.participants.length === 0) {
      await redisService.deleteGroupRoom(roomId);
      logger.info(`[Voxa Server] Group room deleted (empty): ${roomId}`);
      return { room: null, remainingParticipants: [] };
    }

    // If host left, promote the next participant
    if (room.hostSocketId === socketId) {
      room.hostSocketId = room.participants[0];
      logger.info(`[Voxa Server] Host left group room ${roomId}. New host is [${room.hostSocketId}]`);
    }

    await redisService.updateGroupRoom(room);
    logger.info(`[Voxa Server] Socket [${socketId}] left group room ${roomId} (${room.participants.length} remaining)`);
    return { room, remainingParticipants: room.participants };
  }

  async isParticipant(roomId: string, socketId: string): Promise<boolean> {
    const room = await redisService.getGroupRoom(roomId);
    if (!room) return false;
    return room.participants.includes(socketId);
  }
}

export const groupRoomService = new GroupRoomService();
