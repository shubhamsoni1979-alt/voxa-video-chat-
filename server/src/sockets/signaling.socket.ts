import { Socket, Server } from 'socket.io';
import { roomService } from '../services/room.service';
import { redisService } from '../services/redis.service';
import { checkSocketRateLimit } from '../middleware/rateLimiter';
import { logger } from '../utils/logger';

export function registerSignalingHandlers(io: Server, socket: Socket): void {
  // WebRTC Offer Relay
  socket.on('offer', async (data: { roomId: string; sdp: RTCSessionDescriptionInit }) => {
    if (!data || !data.roomId || !data.sdp) return;
    socket.to(data.roomId).emit('offer', {
      sdp: data.sdp,
      senderSocketId: socket.id
    });
  });

  // WebRTC Answer Relay
  socket.on('answer', async (data: { roomId: string; sdp: RTCSessionDescriptionInit }) => {
    if (!data || !data.roomId || !data.sdp) return;
    socket.to(data.roomId).emit('answer', {
      sdp: data.sdp,
      senderSocketId: socket.id
    });
  });

  // ICE Candidate Relay
  socket.on('ice_candidate', async (data: { roomId: string; candidate: RTCIceCandidateInit }) => {
    if (!data || !data.roomId || !data.candidate) return;
    socket.to(data.roomId).emit('ice_candidate', {
      candidate: data.candidate,
      senderSocketId: socket.id
    });
  });

  // Camera / Microphone state change relay
  socket.on('media_state', async (data: { cameraOn: boolean; micOn: boolean }) => {
    const session = await redisService.getSession(socket.id);
    if (session) {
      session.cameraOn = data.cameraOn;
      session.micOn = data.micOn;
      await redisService.setSession(session);

      if (session.currentRoomId) {
        socket.to(session.currentRoomId).emit('peer_media_state', {
          cameraOn: data.cameraOn,
          micOn: data.micOn
        });
      }
    }
  });

  // Block User
  socket.on('block_user', async (data: { targetSocketId: string; roomId: string }) => {
    if (!data.targetSocketId) return;

    await redisService.addBlockedUser(socket.id, data.targetSocketId);
    socket.emit('user_blocked', { blockedSocketId: data.targetSocketId });

    if (data.roomId) {
      socket.to(data.roomId).emit('peer_disconnected', { reason: 'blocked' });
      socket.leave(data.roomId);
      await roomService.closeRoom(data.roomId);
    }
    logger.info(`User [${socket.id}] blocked partner [${data.targetSocketId}]`);
  });

  // Leave room
  socket.on('leave_room', async () => {
    const session = await redisService.getSession(socket.id);
    if (session && session.currentRoomId) {
      socket.to(session.currentRoomId).emit('peer_disconnected', { reason: 'partner_left' });
      socket.leave(session.currentRoomId);
      await roomService.closeRoom(session.currentRoomId);
    }
  });
}
