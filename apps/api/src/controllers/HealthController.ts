import { Request, Response } from 'express';
import { checkDatabaseHealth } from '../config/database.js';
import { mailer } from '../config/mailer.js';

export class HealthController {
  async health(req: Request, res: Response): Promise<void> {
    const isDbConnected = await checkDatabaseHealth();
    const status = isDbConnected ? 'healthy' : 'degraded';
    const statusCode = isDbConnected ? 200 : 503;

    res.status(statusCode).json({
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: isDbConnected ? 'connected' : 'disconnected',
        eventWorker: 'active',
      },
      version: '1.0.0',
    });
  }

  async getCapturedEmails(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      emails: mailer.getCapturedEmails(),
    });
  }

  async clearCapturedEmails(req: Request, res: Response): Promise<void> {
    mailer.clearCapturedEmails();
    res.status(200).json({ message: 'Dev mailbox cleared' });
  }
}

export const healthController = new HealthController();
