import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/TaskService.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { getParam } from '../utils/params.js';

export class TaskController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const projectId = getParam(req, 'projectId');
      const task = await taskService.createTask(projectId, authReq.user.id, req.body);
      res.status(201).json({ task });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const projectId = getParam(req, 'projectId');
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;

      const result = await taskService.listTasks(projectId, authReq.user.id, {
        status: req.query.status as any,
        priority: req.query.priority as any,
        assigneeId: req.query.assigneeId === 'unassigned' ? null : (req.query.assigneeId as string | undefined),
        search: req.query.search as string,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
        page,
        limit,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const taskId = getParam(req, 'taskId');
      const task = await taskService.getTaskById(taskId, authReq.user.id);
      res.status(200).json({ task });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const taskId = getParam(req, 'taskId');
      const task = await taskService.updateTask(taskId, authReq.user.id, req.body);
      res.status(200).json({ task });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const taskId = getParam(req, 'taskId');
      const task = await taskService.updateTaskStatus(
        taskId,
        authReq.user.id,
        req.body.status,
        req.body.position
      );
      res.status(200).json({ task });
    } catch (error) {
      next(error);
    }
  }

  async updateAssignee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const taskId = getParam(req, 'taskId');
      const task = await taskService.updateTaskAssignee(
        taskId,
        authReq.user.id,
        req.body.assigneeId
      );
      res.status(200).json({ task });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const taskId = getParam(req, 'taskId');
      await taskService.deleteTask(taskId, authReq.user.id);
      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getMyTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const workspaceId = req.query.workspaceId as string | undefined;
      const tasks = await taskService.getMyTasks(authReq.user.id, workspaceId);
      res.status(200).json({ tasks });
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
