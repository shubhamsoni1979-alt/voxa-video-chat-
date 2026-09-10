import { Socket, Server } from 'socket.io';
import { groupRoomService } from '../services/group-room.service';
import { checkSocketRateLimit } from '../middleware/rateLimiter';
import { logger } from '../utils/logger';

/**
 * Group Video Calling Socket Handlers
 * Uses Mesh Topology (2–6 participants) over targeted WebRTC signaling.
 * 
 * Signaling Convention:
 * When a newcomer joins a group room, existing members receive `participant_joined`
 * and initiate WebRTC offers towards the newcomer (`isPolite = socket.id < remoteSocketId`).
 * 
 * Future SFU Migration Note:
 * For >6 participants or bandwidth optimization, replace mesh peer relay
 * with an SFU (mediasoup, LiveKit, or pion) without breaking client API contracts.
 */
export function registerGroupHandlers(io: Server, socket: Socket): void {
  // Helper to verify socket is a legitimate participant of the group room
  const verifyGroupOccupant = async (roomId: string, socketId: string): Promise<boolean> => {
    if (!roomId || typeof roomId !== 'string') return false;
    return await groupRoomService.isParticipant(roomId, socketId);
  };

  // Create Group Room
  socket.on('create_group', async (data?: { maxParticipants?: number }) => {
    if (!checkSocketRateLimit(socket.id, 5)) return;

    try {
      const room = await groupRoomService.createGroupRoom(socket.id, data?.maxParticipants || 6);
      await socket.join(room.roomId);

      socket.emit('group_created', { roomId: room.roomId });
      socket.emit('group_joined', {
        roomId: room.roomId,
        participants: room.participants,
        hostSocketId: room.hostSocketId
      });
      logger.info(`[Voxa Group] Host [${socket.id}] created and joined group room ${room.roomId}`);
    } catch (err: any) {
      logger.error(`[Voxa Group] Failed to create group room for [${socket.id}]:`, err);
      socket.emit('group_join_error', { message: 'Failed to create group room.' });
    }
  });

  // Join Group Room
  socket.on('join_group', async (data: { roomId: string }) => {
    if (!checkSocketRateLimit(socket.id, 5)) return;
    if (!data || !data.roomId || typeof data.roomId !== 'string') {
      socket.emit('group_join_error', { message: 'Invalid room ID provided.' });
      return;
    }

    try {
      const result = await groupRoomService.joinGroupRoom(data.roomId, socket.id);
      if (result.error || !result.room) {
        socket.emit('group_join_error', { message: result.error || 'Unable to join group.' });
        return;
      }

      await socket.join(data.roomId);

      // Notify the joiner with full room state
      socket.emit('group_joined', {
        roomId: result.room.roomId,
        participants: result.room.participants,
        hostSocketId: result.room.hostSocketId
      });

      // Notify existing participants that a new peer has joined
      // Convention: Existing members will initiate WebRTC offers to the newcomer
      socket.to(data.roomId).emit('participant_joined', { socketId: socket.id });

      logger.info(`[Voxa Group] Socket [${socket.id}] joined ${data.roomId} (${result.room.participants.length} peers)`);
    } catch (err: any) {
      logger.error(`[Voxa Group] Join error for [${socket.id}] into ${data?.roomId}:`, err);
      socket.emit('group_join_error', { message: 'An unexpected error occurred while joining.' });
    }
  });

  // Leave Group Room
  socket.on('leave_group', async (data: { roomId: string }) => {
    if (!checkSocketRateLimit(socket.id, 5)) return;
    if (!data || !data.roomId) return;

    try {
      await groupRoomService.leaveGroupRoom(data.roomId, socket.id);
      socket.leave(data.roomId);
      socket.to(data.roomId).emit('participant_left', { socketId: socket.id, reason: 'user_left' });
      logger.info(`[Voxa Group] Socket [${socket.id}] left group ${data.roomId}`);
    } catch (err: any) {
      logger.error(`[Voxa Group] Leave error for [${socket.id}]:`, err);
    }
  });

  // Targeted Offer Relay (Mesh WebRTC)
  socket.on('group_offer', async (data: { roomId: string; targetSocketId: string; sdp: RTCSessionDescriptionInit }) => {
    if (!checkSocketRateLimit(socket.id, 50)) return;
    if (!data || !data.roomId || !data.targetSocketId || !data.sdp) return;

    const [senderAllowed, targetAllowed] = await Promise.all([
      verifyGroupOccupant(data.roomId, socket.id),
      verifyGroupOccupant(data.roomId, data.targetSocketId)
    ]);

    if (senderAllowed && targetAllowed) {
      socket.to(data.targetSocketId).emit('group_offer', {
        sdp: data.sdp,
        senderSocketId: socket.id
      });
    } else {
      logger.warn(`[Voxa Group] Unauthorized group_offer from [${socket.id}] to [${data.targetSocketId}] in ${data.roomId}`);
    }
  });

  // Targeted Answer Relay (Mesh WebRTC)
  socket.on('group_answer', async (data: { roomId: string; targetSocketId: string; sdp: RTCSessionDescriptionInit }) => {
    if (!checkSocketRateLimit(socket.id, 50)) return;
    if (!data || !data.roomId || !data.targetSocketId || !data.sdp) return;

    const [senderAllowed, targetAllowed] = await Promise.all([
      verifyGroupOccupant(data.roomId, socket.id),
      verifyGroupOccupant(data.roomId, data.targetSocketId)
    ]);

    if (senderAllowed && targetAllowed) {
      socket.to(data.targetSocketId).emit('group_answer', {
        sdp: data.sdp,
        senderSocketId: socket.id
      });
    } else {
      logger.warn(`[Voxa Group] Unauthorized group_answer from [${socket.id}] to [${data.targetSocketId}] in ${data.roomId}`);
    }
  });

  // Targeted ICE Candidate Relay (Mesh WebRTC)
  socket.on('group_ice_candidate', async (data: { roomId: string; targetSocketId: string; candidate: RTCIceCandidateInit }) => {
    if (!checkSocketRateLimit(socket.id, 100)) return;
    if (!data || !data.roomId || !data.targetSocketId || !data.candidate) return;

    const [senderAllowed, targetAllowed] = await Promise.all([
      verifyGroupOccupant(data.roomId, socket.id),
      verifyGroupOccupant(data.roomId, data.targetSocketId)
    ]);

    if (senderAllowed && targetAllowed) {
      socket.to(data.targetSocketId).emit('group_ice_candidate', {
        candidate: data.candidate,
        senderSocketId: socket.id
      });
    }
  });

  // Group Media State Broadcast (Mute/Camera state)
  socket.on('group_media_state', async (data: { roomId: string; cameraOn: boolean; micOn: boolean }) => {
    if (!checkSocketRateLimit(socket.id, 10)) return;
    if (!data || !data.roomId) return;

    if (await verifyGroupOccupant(data.roomId, socket.id)) {
      socket.to(data.roomId).emit('group_peer_media_state', {
        socketId: socket.id,
        cameraOn: Boolean(data.cameraOn),
        micOn: Boolean(data.micOn)
      });
    }
  });

  // Group Text Chat Broadcast
  socket.on('group_chat_message', async (data: { roomId: string; text: string }) => {
    if (!checkSocketRateLimit(socket.id, 15)) {
      socket.emit('error_message', { message: 'Chat rate limit exceeded. Please slow down.' });
      return;
    }

    if (!data || !data.roomId || !data.text || typeof data.text !== 'string') return;

    const sanitizedText = data.text.trim().slice(0, 500);
    if (!sanitizedText) return;

    if (await verifyGroupOccupant(data.roomId, socket.id)) {
      io.to(data.roomId).emit('group_chat_message', {
        senderSocketId: socket.id,
        text: sanitizedText,
        timestamp: Date.now()
      });
    }
  });
}
