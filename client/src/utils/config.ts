export const config = {
  stunServer: import.meta.env.VITE_STUN_SERVER || 'stun:stun.l.google.com:19302',
  turnServer: import.meta.env.VITE_TURN_SERVER || '',
  turnUsername: import.meta.env.VITE_TURN_USERNAME || '',
  turnPassword: import.meta.env.VITE_TURN_PASSWORD || '',
};

export const getIceServers = (): RTCIceServer[] => {
  const servers: RTCIceServer[] = [
    { urls: config.stunServer || 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ];

  if (config.turnServer) {
    servers.push({
      urls: config.turnServer,
      username: config.turnUsername,
      credential: config.turnPassword
    });
  }

  return servers;
};
