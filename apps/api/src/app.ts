import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { apiLimiter } from './middleware/rateLimit.middleware.js';
import { logger } from './utils/logger.js';

export function createApp(): Express {
  const app = express();

  // 1. Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // 2. CORS
  app.use(
    cors({
      origin: [env.CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // 3. Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser(env.SESSION_SECRET));

  // 4. Rate Limiting on API endpoints
  app.use('/api', apiLimiter);

  // 5. Request logging in dev
  if (env.NODE_ENV !== 'test') {
    app.use((req, res, next) => {
      logger.debug(`${req.method} ${req.path}`);
      next();
    });
  }

  // 6. Mount REST API Routes
  app.use('/api/v1', apiRouter);

  // 7. Root API info
  app.get('/', (req, res) => {
    res.json({
      name: 'Project Management Platform API',
      version: '1.0.0',
      docs: '/api/v1/health',
    });
  });

  // 8. 404 Handler for undefined API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  // 9. Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
