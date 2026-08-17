import rateLimit from 'express-rate-limit';

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

export const reportRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit 10 reports per minute per IP
  message: { error: 'Report rate limit exceeded. Please wait a moment.' }
});

// Socket event rate limiter map (Socket ID -> timestamp list)
const socketEventTracker = new Map<string, number[]>();

export function checkSocketRateLimit(socketId: string, maxEventsPerSec = 10): boolean {
  const now = Date.now();
  const timestamps = socketEventTracker.get(socketId) || [];
  
  // Filter events older than 1 second
  const recent = timestamps.filter(ts => now - ts < 1000);
  
  if (recent.length >= maxEventsPerSec) {
    return false; // Exceeded limit
  }

  recent.push(now);
  socketEventTracker.set(socketId, recent);
  return true;
}

export function clearSocketRateLimit(socketId: string): void {
  socketEventTracker.delete(socketId);
}
