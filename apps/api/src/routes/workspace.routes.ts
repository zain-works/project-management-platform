import { Router } from 'express';
import { workspaceController } from '../controllers/WorkspaceController.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteMemberSchema,
  acceptInvitationSchema,
  updateMemberRoleSchema,
} from '@pmp/shared';

const router = Router();

// All workspace routes require authentication
router.use(requireAuth);

router.post('/', validateBody(createWorkspaceSchema), (req, res, next) =>
  workspaceController.create(req, res, next)
);
router.get('/', (req, res, next) => workspaceController.list(req, res, next));
router.get('/:workspaceId', (req, res, next) => workspaceController.getById(req, res, next));
router.patch('/:workspaceId', validateBody(updateWorkspaceSchema), (req, res, next) =>
  workspaceController.update(req, res, next)
);

// Members & Invitations
router.get('/:workspaceId/members', (req, res, next) =>
  workspaceController.listMembers(req, res, next)
);
router.post('/:workspaceId/invitations', validateBody(inviteMemberSchema), (req, res, next) =>
  workspaceController.inviteMember(req, res, next)
);
router.post('/invitations/accept', validateBody(acceptInvitationSchema), (req, res, next) =>
  workspaceController.acceptInvitation(req, res, next)
);
router.patch('/:workspaceId/members/:userId', validateBody(updateMemberRoleSchema), (req, res, next) =>
  workspaceController.updateMemberRole(req, res, next)
);
router.delete('/:workspaceId/members/:userId', (req, res, next) =>
  workspaceController.removeMember(req, res, next)
);
router.delete('/:workspaceId', (req, res, next) =>
  workspaceController.delete(req, res, next)
);

export default router;
