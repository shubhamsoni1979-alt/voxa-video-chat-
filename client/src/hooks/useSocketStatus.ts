import { useState, useEffect } from 'react';
import { getSocket } from '../services/socket';

export function useSocketStatus() {
  const socket = getSocket();
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [isConnecting, setIsConnecting] = useState<boolean>(!socket.connected && socket.active);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setIsConnecting(false);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setIsConnecting(false);
    };

    const handleConnectError = () => {
      setIsConnected(false);
      setIsConnecting(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // Don't force-connect — socket has autoConnect: true and its own reconnection logic
    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, [socket]);

  return { isConnected, isConnecting };
}
