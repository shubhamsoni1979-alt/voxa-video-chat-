import { Socket, Server } from 'socket.io';
import { roomService } from '../services/room.service';
import { redisService } from '../services/redis.service';
import { checkSocketRateLimit } from '../middleware/rateLimiter';
import { logger } from '../utils/logger';

export function registerSignalingHandlers(io: Server, socket: Socket): void {
  // Helper to verify socket is actually an authorized occupant of room
  const verifyRoomOccupant = async (roomId: string): Promise<boolean> => {
    if (!roomId || typeof roomId !== 'string') return false;
    // Check if socket is in the Socket.IO room
    if (!socket.rooms.has(roomId)) return false;
    // Check server room state
    const room = await roomService.getRoom(roomId);
    if (!room) return false;
    return room.userA === socket.id || room.userB === socket.id;
  };

  // WebRTC Offer Relay
  socket.on('offer', async (data: { roomId: string; sdp: RTCSessionDescriptionInit }) => {
    if (!checkSocketRateLimit(socket.id, 20)) return;
    if (!data || !data.roomId || !data.sdp) return;
    
    if (await verifyRoomOccupant(data.roomId)) {
      socket.to(data.roomId).emit('offer', {
        sdp: data.sdp,
        senderSocketId: socket.id
      });
    } else {
      logger.warn(`Unauthorized offer attempt by [${socket.id}] for room [${data?.roomId}]`);
    }
  });

  // WebRTC Answer Relay
  socket.on('answer', async (data: { roomId: string; sdp: RTCSessionDescriptionInit }) => {
    if (!checkSocketRateLimit(socket.id, 20)) return;
    if (!data || !data.roomId || !data.sdp) return;

    if (await verifyRoomOccupant(data.roomId)) {
      socket.to(data.roomId).emit('answer', {
        sdp: data.sdp,
        senderSocketId: socket.id
      });
    } else {
      logger.warn(`Unauthorized answer attempt by [${socket.id}] for room [${data?.roomId}]`);
    }
  });

  // ICE Candidate Relay
  socket.on('ice_candidate', async (data: { roomId: string; candidate: RTCIceCandidateInit }) => {
    if (!checkSocketRateLimit(socket.id, 50)) return;
    if (!data || !data.roomId || !data.candidate) return;

    if (await verifyRoomOccupant(data.roomId)) {
      socket.to(data.roomId).emit('ice_candidate', {
        candidate: data.candidate,
        senderSocketId: socket.id
      });
    }
  });

  // Camera / Microphone state change relay
  socket.on('media_state', async (data: { cameraOn: boolean; micOn: boolean }) => {
    if (!checkSocketRateLimit(socket.id, 10)) return;
    const session = await redisService.getSession(socket.id);
    if (session) {
      session.cameraOn = Boolean(data?.cameraOn);
      session.micOn = Boolean(data?.micOn);
      await redisService.setSession(session);

      if (session.currentRoomId && await verifyRoomOccupant(session.currentRoomId)) {
        socket.to(session.currentRoomId).emit('peer_media_state', {
          cameraOn: session.cameraOn,
          micOn: session.micOn
        });
      }
    }
  });

  // Block User
  socket.on('block_user', async (data: { targetSocketId: string; roomId: string }) => {
    if (!checkSocketRateLimit(socket.id, 5)) return;
    if (!data || !data.targetSocketId || typeof data.targetSocketId !== 'string') return;

    await redisService.addBlockedUser(socket.id, data.targetSocketId);
    socket.emit('user_blocked', { blockedSocketId: data.targetSocketId });

    if (data.roomId && await verifyRoomOccupant(data.roomId)) {
      socket.to(data.roomId).emit('peer_disconnected', { reason: 'blocked' });
      socket.leave(data.roomId);
      await roomService.closeRoom(data.roomId);
    }
    logger.info(`User [${socket.id}] blocked partner [${data.targetSocketId}]`);
  });

  // Real-time Text Chat Message Relay
  socket.on('chat_message', async (data: { roomId: string; text: string; id: string; timestamp: number }) => {
    if (!checkSocketRateLimit(socket.id, 10)) {
      socket.emit('error_message', { message: 'Chat rate limit exceeded. Please slow down.' });
      return;
    }

    if (!data || !data.roomId || !data.text || typeof data.text !== 'string') return;

    // Sanitize chat text & limit message size (max 500 characters)
    const sanitizedText = data.text.trim().slice(0, 500);
    if (!sanitizedText) return;

    if (await verifyRoomOccupant(data.roomId)) {
      socket.to(data.roomId).emit('chat_message', {
        text: sanitizedText,
        id: String(data.id || Date.now()).slice(0, 50),
        timestamp: Number(data.timestamp) || Date.now(),
        senderSocketId: socket.id
      });
    } else {
      logger.warn(`Unauthorized chat_message attempt by [${socket.id}] for room [${data.roomId}]`);
    }
  });

  // Leave room
  socket.on('leave_room', async () => {
    if (!checkSocketRateLimit(socket.id, 5)) return;
    const session = await redisService.getSession(socket.id);
    if (session && session.currentRoomId) {
      if (await verifyRoomOccupant(session.currentRoomId)) {
        socket.to(session.currentRoomId).emit('peer_disconnected', { reason: 'partner_left' });
        socket.leave(session.currentRoomId);
        await roomService.closeRoom(session.currentRoomId);
      }
    }
  });
}
