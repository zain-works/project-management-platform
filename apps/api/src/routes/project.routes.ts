import { Router } from 'express';
import { projectController } from '../controllers/ProjectController.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { createProjectSchema, updateProjectSchema } from '@pmp/shared';

const router = Router();

router.post(
  '/workspaces/:workspaceId/projects',
  requireAuth,
  validateBody(createProjectSchema),
  (req, res, next) => projectController.create(req, res, next)
);
router.get('/workspaces/:workspaceId/projects', requireAuth, (req, res, next) =>
  projectController.list(req, res, next)
);

router.get('/projects/:projectId', requireAuth, (req, res, next) =>
  projectController.getById(req, res, next)
);
router.patch(
  '/projects/:projectId',
  requireAuth,
  validateBody(updateProjectSchema),
  (req, res, next) => projectController.update(req, res, next)
);
router.delete('/projects/:projectId', requireAuth, (req, res, next) =>
  projectController.archive(req, res, next)
);
router.get('/projects/:projectId/activity', requireAuth, (req, res, next) =>
  projectController.getActivity(req, res, next)
);

export default router;
