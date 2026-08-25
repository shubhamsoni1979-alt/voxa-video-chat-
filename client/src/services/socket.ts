import { io, Socket } from 'socket.io-client';
import { API_URL } from '../utils/config';

let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socketInstance) {
    const serverUrl = API_URL || window.location.origin;
    socketInstance = io(serverUrl, {
      transports: ['polling', 'websocket'],
      autoConnect: true,
      reconnectionAttempts: 50,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      withCredentials: true
    });
  }
  return socketInstance;
};
