import { Router } from 'express';
import { notificationController } from '../controllers/NotificationController.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res, next) => notificationController.list(req, res, next));
router.get('/unread-count', (req, res, next) => notificationController.unreadCount(req, res, next));
router.patch('/:notificationId/read', (req, res, next) =>
  notificationController.markRead(req, res, next)
);
router.post('/read-all', (req, res, next) => notificationController.markAllRead(req, res, next));

export default router;
