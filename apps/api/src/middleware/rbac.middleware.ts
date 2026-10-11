import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware.js';
import { workspaceRepository } from '../repositories/WorkspaceRepository.js';
import { WorkspaceRole, hasMinimumRole } from '@pmp/shared';

export function requireWorkspaceRole(minRole: WorkspaceRole) {
  return async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const workspaceId = req.params.workspaceId || req.body?.workspaceId || req.query?.workspaceId;

      if (!workspaceId) {
        res.status(400).json({ error: 'Workspace ID required for authorization check' });
        return;
      }

      const membership = await workspaceRepository.findMember(workspaceId, authReq.user.id);
      if (!membership) {
        res.status(403).json({ error: 'You are not a member of this workspace' });
        return;
      }

      if (!hasMinimumRole(membership.role as WorkspaceRole, minRole)) {
        res.status(403).json({
          error: `Insufficient permissions. Requires at least ${minRole} role.`,
        });
        return;
      }

      req.workspaceMembership = membership;
      next();
    } catch (error) {
      next(error);
    }
  };
}
