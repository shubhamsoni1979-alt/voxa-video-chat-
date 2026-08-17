import { Router, Request, Response } from 'express';
import { reportRateLimiter } from '../middleware/rateLimiter';
import { logger } from '../utils/logger';

const router = Router();

// In-memory reports store for MVP
interface ReportRecord {
  id: string;
  reporterIp: string;
  reportedSocketId: string;
  roomId: string;
  reason: string;
  details?: string;
  timestamp: string;
}

const reports: ReportRecord[] = [];

router.post('/reports', reportRateLimiter, (req: Request, res: Response) => {
  try {
    const { reportedSocketId, roomId, reason, details } = req.body;

    if (!reportedSocketId || !reason) {
      return res.status(400).json({ error: 'Missing required report fields (reportedSocketId, reason)' });
    }

    const reportRecord: ReportRecord = {
      id: `report_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      reporterIp: req.ip || 'unknown',
      reportedSocketId,
      roomId: roomId || 'none',
      reason,
      details: details || '',
      timestamp: new Date().toISOString()
    };

    reports.push(reportRecord);
    logger.info(`User report received: Reason [${reason}] against target [${reportedSocketId}] in room [${roomId}]`);

    return res.status(200).json({ success: true, message: 'Report submitted successfully. Thank you for helping keep Voxa safe.' });
  } catch (error: any) {
    logger.error('Error handling user report API:', error.message);
    return res.status(500).json({ error: 'Internal server error processing report.' });
  }
});

router.get('/reports/count', (req: Request, res: Response) => {
  res.json({ totalReports: reports.length });
});

export default router;
