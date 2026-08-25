const defaultUrl = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000'
  : 'https://voxa-video-chat.onrender.com';

export const API_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL || defaultUrl).replace(/\/$/, '');

export const config = {
  apiUrl: API_URL,
  stunServer: import.meta.env.VITE_STUN_SERVER || 'stun:stun.l.google.com:19302',
  turnServer: import.meta.env.VITE_TURN_SERVER || '',
  turnUsername: import.meta.env.VITE_TURN_USERNAME || '',
  turnPassword: import.meta.env.VITE_TURN_PASSWORD || '',
};

export const getIceServers = (): RTCIceServer[] => {
  const servers: RTCIceServer[] = [
    // Multiple public STUN servers for NAT discovery across worldwide networks
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:global.stun.twilio.com:3478' }
  ];

  // Custom TURN configuration from environment variables if provided
  if (config.turnServer) {
    const turnUrls = config.turnServer.includes(',')
      ? config.turnServer.split(',').map((s: string) => s.trim())
      : config.turnServer;

    servers.push({
      urls: turnUrls,
      username: config.turnUsername,
      credential: config.turnPassword
    });
  } else {
    // OpenRelay TURN Fallback for 4G/5G cellular & symmetric NAT traversal when no environment TURN is set
    servers.push(
      {
        urls: [
          'turn:openrelay.metered.ca:80',
          'turn:openrelay.metered.ca:443',
          'turn:openrelay.metered.ca:443?transport=tcp'
        ],
        username: 'openrelay',
        credential: 'openrelay'
      }
    );
  }

  return servers;
};
