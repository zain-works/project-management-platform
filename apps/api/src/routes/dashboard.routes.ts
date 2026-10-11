import { Router } from 'express';
import { dashboardController } from '../controllers/DashboardController.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/dashboard', requireAuth, (req, res, next) =>
  dashboardController.getDashboard(req, res, next)
);
router.get('/tasks/my-tasks', requireAuth, (req, res, next) =>
  dashboardController.getMyTasks(req, res, next)
);
router.get('/search', requireAuth, (req, res, next) =>
  dashboardController.search(req, res, next)
);

export default router;
