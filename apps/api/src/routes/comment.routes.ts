import { Router } from 'express';
import { commentController } from '../controllers/CommentController.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { createCommentSchema, updateCommentSchema } from '@pmp/shared';

const router = Router();

router.get('/tasks/:taskId/comments', requireAuth, (req, res, next) =>
  commentController.list(req, res, next)
);
router.post(
  '/tasks/:taskId/comments',
  requireAuth,
  validateBody(createCommentSchema),
  (req, res, next) => commentController.create(req, res, next)
);
router.patch(
  '/comments/:commentId',
  requireAuth,
  validateBody(updateCommentSchema),
  (req, res, next) => commentController.update(req, res, next)
);
router.delete('/comments/:commentId', requireAuth, (req, res, next) =>
  commentController.delete(req, res, next)
);

export default router;
