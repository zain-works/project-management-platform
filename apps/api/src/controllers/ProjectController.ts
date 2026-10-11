import { Request, Response, NextFunction } from 'express';
import { projectService } from '../services/ProjectService.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { getParam } from '../utils/params.js';

export class ProjectController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const workspaceId = getParam(req, 'workspaceId');
      const project = await projectService.createProject(workspaceId, authReq.user.id, req.body);
      res.status(201).json({ project });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const workspaceId = getParam(req, 'workspaceId');
      const projects = await projectService.listProjects(workspaceId, authReq.user.id, {
        status: req.query.status as any,
        search: req.query.search as string,
      });
      res.status(200).json({ projects });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const projectId = getParam(req, 'projectId');
      const project = await projectService.getProjectById(projectId, authReq.user.id);
      res.status(200).json({ project });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const projectId = getParam(req, 'projectId');
      const updated = await projectService.updateProject(projectId, authReq.user.id, req.body);
      res.status(200).json({ project: updated });
    } catch (error) {
      next(error);
    }
  }

  async archive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const projectId = getParam(req, 'projectId');
      const archived = await projectService.archiveProject(projectId, authReq.user.id);
      res.status(200).json({ project: archived, message: 'Project archived successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const projectId = getParam(req, 'projectId');
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await projectService.getProjectActivity(projectId, authReq.user.id, {
        page,
        limit,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const projectController = new ProjectController();
