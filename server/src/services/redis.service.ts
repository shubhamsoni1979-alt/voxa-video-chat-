import Redis from 'ioredis';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { MatchmakingUser, RoomState, UserSession } from '../types';

class RedisService {
  private redisClient: Redis | null = null;
  private isRedisConnected = false;

  // In-memory fallbacks when Redis is not available
  private memoryQueue: MatchmakingUser[] = [];
  private memorySessions: Map<string, UserSession> = new Map();
  private memoryRooms: Map<string, RoomState> = new Map();

  constructor() {
    this.initRedis();
  }

  private initRedis() {
    try {
      const client = new Redis(config.redisUrl, {
        maxRetriesPerRequest: 1,
        retryStrategy(times) {
          if (times > 2) {
            return null; // Stop retrying and fall back to in-memory mode
          }
          return 500;
        },
        lazyConnect: true
      });

      client.on('connect', () => {
        this.isRedisConnected = true;
        logger.info('Connected to Redis server successfully.');
      });

      client.on('error', (err) => {
        if (this.isRedisConnected) {
          logger.warn('Redis error encountered, switching fallback state:', err.message);
        }
        this.isRedisConnected = false;
      });

      client.connect().then(() => {
        this.redisClient = client;
        this.isRedisConnected = true;
      }).catch((err) => {
        logger.warn(`Redis connection failed (${err.message}). Using high-performance in-memory state manager.`);
        this.isRedisConnected = false;
      });
    } catch (err: any) {
      logger.warn(`Failed to initialize Redis client (${err?.message}). Operating in in-memory mode.`);
      this.isRedisConnected = false;
    }
  }

  // --- Session Management ---
  async setSession(session: UserSession): Promise<void> {
    this.memorySessions.set(session.socketId, session);
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.setex(`session:${session.socketId}`, 3600, JSON.stringify(session));
      } catch (e) {
        // Fallback to memory already stored
      }
    }
  }

  async getSession(socketId: string): Promise<UserSession | null> {
    // Prefer in-memory (always written first, authoritative for this process)
    const memSession = this.memorySessions.get(socketId);
    if (memSession) return memSession;

    // Fall back to Redis (may contain data from other server instances)
    if (this.isRedisConnected && this.redisClient) {
      try {
        const raw = await this.redisClient.get(`session:${socketId}`);
        if (raw) {
          const session: UserSession = JSON.parse(raw);
          this.memorySessions.set(socketId, session);
          return session;
        }
      } catch (e) {
        // Redis read failed — no data available
      }
    }
    return null;
  }

  async removeSession(socketId: string): Promise<void> {
    this.memorySessions.delete(socketId);
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.del(`session:${socketId}`);
      } catch (e) {}
    }
  }

  // --- Queue Management ---
  async addToQueue(user: MatchmakingUser): Promise<void> {
    // Remove duplicate entry if exists
    this.memoryQueue = this.memoryQueue.filter(u => u.socketId !== user.socketId);
    this.memoryQueue.push(user);

    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.rpush('queue:matchmaking', JSON.stringify(user));
      } catch (e) {}
    }
  }

  async removeFromQueue(socketId: string): Promise<void> {
    this.memoryQueue = this.memoryQueue.filter(u => u.socketId !== socketId);

    if (this.isRedisConnected && this.redisClient) {
      try {
        const items = await this.redisClient.lrange('queue:matchmaking', 0, -1);
        for (const item of items) {
          const u: MatchmakingUser = JSON.parse(item);
          if (u.socketId === socketId) {
            await this.redisClient.lrem('queue:matchmaking', 0, item);
          }
        }
      } catch (e) {}
    }
  }

  async findMatchForUser(userSocketId: string, blockedSockets: string[]): Promise<MatchmakingUser | null> {
    // Check in-memory queue first or Redis
    for (let i = 0; i < this.memoryQueue.length; i++) {
      const candidate = this.memoryQueue[i];
      if (candidate.socketId !== userSocketId && !blockedSockets.includes(candidate.socketId)) {
        // Remove candidate from queue
        this.memoryQueue.splice(i, 1);
        await this.removeFromQueue(candidate.socketId);
        return candidate;
      }
    }
    return null;
  }

  // --- Room Management ---
  async createRoom(room: RoomState): Promise<void> {
    this.memoryRooms.set(room.roomId, room);
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.setex(`room:${room.roomId}`, 7200, JSON.stringify(room));
      } catch (e) {}
    }
  }

  async getRoom(roomId: string): Promise<RoomState | null> {
    // Prefer in-memory (always written first, authoritative for this process)
    const memRoom = this.memoryRooms.get(roomId);
    if (memRoom) return memRoom;

    // Fall back to Redis (may contain data from other server instances)
    if (this.isRedisConnected && this.redisClient) {
      try {
        const raw = await this.redisClient.get(`room:${roomId}`);
        if (raw) {
          const room: RoomState = JSON.parse(raw);
          this.memoryRooms.set(roomId, room);
          return room;
        }
      } catch (e) {}
    }
    return null;
  }

  async deleteRoom(roomId: string): Promise<void> {
    this.memoryRooms.delete(roomId);
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.del(`room:${roomId}`);
      } catch (e) {}
    }
  }

  // --- User Blocklist Management ---
  async addBlockedUser(userSocketId: string, blockedSocketId: string): Promise<void> {
    const session = await this.getSession(userSocketId);
    if (session) {
      if (!session.blockedSockets.includes(blockedSocketId)) {
        session.blockedSockets.push(blockedSocketId);
        await this.setSession(session);
      }
    }
  }
}

export const redisService = new RedisService();
