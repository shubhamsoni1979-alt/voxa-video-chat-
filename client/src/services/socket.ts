import { io, Socket } from 'socket.io-client';
import { API_URL } from '../utils/config';

let socketInstance: Socket | null = null;

// Warm up Render backend (free tier cold-start takes ~15s to wake from sleep).
// We fire a /health ping and wait, so Socket.IO doesn't hit a 400 on a sleeping server.
const wakeBackend = async (serverUrl: string): Promise<void> => {
  try {
    await fetch(`${serverUrl}/health`, { method: 'GET', mode: 'cors' });
  } catch {
    // Ignore errors — socket reconnect loop will handle it
  }
};

export const getSocket = (): Socket => {
  if (!socketInstance) {
    const serverUrl = API_URL || window.location.origin;

    // Fire-and-forget background warm-up ping. Not awaited intentionally:
    // Socket.IO has its own reconnection loop, so the wake-up just gives
    // Render's free-tier server a head start on cold-boot before the socket handshake.
    wakeBackend(serverUrl);

    socketInstance = io(serverUrl, {
      // polling MUST come first — Socket.IO requires a successful polling
      // handshake before upgrading to WebSocket. Render's free-tier load
      // balancer terminates idle WebSocket connections, so we always start
      // on polling and let the server upgrade us.
      transports: ['polling', 'websocket'],
      upgrade: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
      withCredentials: true
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('[Voxa Socket] Connection error (will retry):', err.message);
    });
  }
  return socketInstance;
};
