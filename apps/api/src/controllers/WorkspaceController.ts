import { Request, Response, NextFunction } from 'express';
import { workspaceService } from '../services/WorkspaceService.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { getParam } from '../utils/params.js';

export class WorkspaceController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const workspace = await workspaceService.createWorkspace(authReq.user.id, req.body);
      res.status(201).json({ workspace });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const workspaces = await workspaceService.getWorkspacesForUser(authReq.user.id);
      res.status(200).json({ workspaces });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const workspaceId = getParam(req, 'workspaceId');
      const workspace = await workspaceService.getWorkspaceById(workspaceId, authReq.user.id);
      res.status(200).json({ workspace });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const workspaceId = getParam(req, 'workspaceId');
      const updated = await workspaceService.updateWorkspace(workspaceId, authReq.user.id, req.body);
      res.status(200).json({ workspace: updated });
    } catch (error) {
      next(error);
    }
  }

  async listMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const workspaceId = getParam(req, 'workspaceId');
      const members = await workspaceService.listMembers(workspaceId, authReq.user.id);
      res.status(200).json({ members });
    } catch (error) {
      next(error);
    }
  }

  async inviteMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const workspaceId = getParam(req, 'workspaceId');
      const result = await workspaceService.inviteMember(workspaceId, authReq.user.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async acceptInvitation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const workspace = await workspaceService.acceptInvitation(req.body.token, authReq.user.id);
      res.status(200).json({ workspace, message: 'Joined workspace successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateMemberRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const workspaceId = getParam(req, 'workspaceId');
      const userId = getParam(req, 'userId');
      const updated = await workspaceService.updateMemberRole(
        workspaceId,
        authReq.user.id,
        userId,
        req.body.role
      );
      res.status(200).json({ member: updated });
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const workspaceId = getParam(req, 'workspaceId');
      const userId = getParam(req, 'userId');
      await workspaceService.removeMember(workspaceId, authReq.user.id, userId);
      res.status(200).json({ message: 'Member removed from workspace' });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const workspaceId = getParam(req, 'workspaceId');
      await workspaceService.deleteWorkspace(workspaceId, authReq.user.id);
      res.status(200).json({ message: 'Workspace deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const workspaceController = new WorkspaceController();
