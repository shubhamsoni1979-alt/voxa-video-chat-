import { Router, Request, Response } from 'express';
import { reportRateLimiter } from '../middleware/rateLimiter';
import { logger } from '../utils/logger';
import { config } from '../config/env';

const router = Router();

interface ReportRecord {
  id: string;
  reporterIp: string;
  reportedSocketId: string;
  roomId: string;
  reason: string;
  details?: string;
  timestamp: string;
}

// WARNING: Reports are stored in-memory only and will be lost on server restart.
// TODO: Persist reports to a database (e.g., PostgreSQL, MongoDB) for production use.
const MAX_REPORTS_IN_MEMORY = 1000;
const reports: ReportRecord[] = [];

// Helper to sanitize strings
function sanitizeString(str: any, maxLen = 300): string {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen).replace(/[<>]/g, '');
}

router.post('/reports', reportRateLimiter, (req: Request, res: Response) => {
  try {
    const rawReportedSocketId = req.body?.reportedSocketId;
    const rawRoomId = req.body?.roomId;
    const rawReason = req.body?.reason;
    const rawDetails = req.body?.details;

    const reportedSocketId = sanitizeString(rawReportedSocketId, 100);
    const roomId = sanitizeString(rawRoomId, 100);
    const reason = sanitizeString(rawReason, 100);
    const details = sanitizeString(rawDetails, 500);

    if (!reportedSocketId || !reason) {
      return res.status(400).json({ error: 'Missing required report fields (reportedSocketId, reason)' });
    }

    const reportRecord: ReportRecord = {
      id: `report_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      reporterIp: req.ip || 'unknown',
      reportedSocketId,
      roomId: roomId || 'none',
      reason,
      details,
      timestamp: new Date().toISOString()
    };

    reports.push(reportRecord);

    // Prevent unbounded memory growth — keep only the most recent reports
    if (reports.length > MAX_REPORTS_IN_MEMORY) {
      reports.splice(0, reports.length - MAX_REPORTS_IN_MEMORY);
    }

    logger.info(`User report received: Reason [${reason}] against target [${reportedSocketId}] in room [${roomId}]`);

    return res.status(200).json({ success: true, message: 'Report submitted successfully. Thank you for helping keep Voxa safe.' });
  } catch (error: any) {
    logger.error('Error handling user report API:', error.message);
    return res.status(500).json({ error: 'Internal server error processing report.' });
  }
});

router.get('/reports/count', (req: Request, res: Response) => {
  if (config.nodeEnv === 'production') {
    return res.status(403).json({ error: 'Access denied.' });
  }
  res.json({ totalReports: reports.length });
});

export default router;
