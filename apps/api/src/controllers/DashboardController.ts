import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/DashboardService.js';
import { taskRepository } from '../repositories/TaskRepository.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export class DashboardController {
  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const workspaceId = req.query.workspaceId as string;
      if (!workspaceId) {
        res.status(400).json({ error: 'workspaceId query parameter is required' });
        return;
      }

      const data = await dashboardService.getDashboardData(workspaceId, authReq.user.id);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async getMyTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const workspaceId = req.query.workspaceId as string | undefined;
      const tasks = await taskRepository.findAssignedToUser(authReq.user.id, workspaceId);
      res.status(200).json({ tasks });
    } catch (error) {
      next(error);
    }
  }

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const workspaceId = req.query.workspaceId as string;
      const q = (req.query.q as string) || '';

      if (!workspaceId) {
        res.status(400).json({ error: 'workspaceId query parameter is required' });
        return;
      }

      const results = await dashboardService.search(workspaceId, authReq.user.id, q);
      res.status(200).json(results);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
