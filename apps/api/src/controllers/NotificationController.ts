import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/NotificationService.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { getParam } from '../utils/params.js';

export class NotificationController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const unreadOnly = req.query.unreadOnly === 'true';
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await notificationService.listNotifications(authReq.user.id, {
        unreadOnly,
        page,
        limit,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async unreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const count = await notificationService.countUnread(authReq.user.id);
      res.status(200).json({ unreadCount: count });
    } catch (error) {
      next(error);
    }
  }

  async markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const notificationId = getParam(req, 'notificationId');
      const notification = await notificationService.markAsRead(notificationId, authReq.user.id);
      res.status(200).json({ notification });
    } catch (error) {
      next(error);
    }
  }

  async markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const count = await notificationService.markAllAsRead(authReq.user.id);
      res.status(200).json({ count, message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
