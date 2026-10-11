import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import workspaceRoutes from './workspace.routes.js';
import projectRoutes from './project.routes.js';
import taskRoutes from './task.routes.js';
import commentRoutes from './comment.routes.js';
import notificationRoutes from './notification.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const apiRouter = Router();

// Public routes (Health & Dev Inspection)
apiRouter.use('/', healthRoutes);

// Auth routes
apiRouter.use('/auth', authRoutes);

// Workspace routes
apiRouter.use('/workspaces', workspaceRoutes);

// Project, Task, and Comment routes
apiRouter.use('/', projectRoutes);
apiRouter.use('/', taskRoutes);
apiRouter.use('/', commentRoutes);

// Notifications & Dashboard
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/', dashboardRoutes);

export default apiRouter;
