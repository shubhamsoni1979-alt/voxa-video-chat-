import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socketInstance) {
    const serverUrl = import.meta.env.VITE_SERVER_URL || window.location.origin;
    socketInstance = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });
  }
  return socketInstance;
};
