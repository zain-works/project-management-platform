import { Router } from 'express';
import { taskController } from '../controllers/TaskController.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  assignTaskSchema,
} from '@pmp/shared';

const router = Router();

router.post(
  '/projects/:projectId/tasks',
  requireAuth,
  validateBody(createTaskSchema),
  (req, res, next) => taskController.create(req, res, next)
);
router.get('/projects/:projectId/tasks', requireAuth, (req, res, next) =>
  taskController.list(req, res, next)
);

router.get('/tasks/my-tasks', requireAuth, (req, res, next) =>
  taskController.getMyTasks(req, res, next)
);

router.get('/tasks/:taskId', requireAuth, (req, res, next) =>
  taskController.getById(req, res, next)
);
router.patch(
  '/tasks/:taskId',
  requireAuth,
  validateBody(updateTaskSchema),
  (req, res, next) => taskController.update(req, res, next)
);
router.patch(
  '/tasks/:taskId/status',
  requireAuth,
  validateBody(updateTaskStatusSchema),
  (req, res, next) => taskController.updateStatus(req, res, next)
);
router.patch(
  '/tasks/:taskId/assignee',
  requireAuth,
  validateBody(assignTaskSchema),
  (req, res, next) => taskController.updateAssignee(req, res, next)
);
router.delete('/tasks/:taskId', requireAuth, (req, res, next) =>
  taskController.delete(req, res, next)
);

export default router;
