import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (statusCode >= 500) {
    logger.error(`Server Error: ${message}`, {
      path: req.path,
      method: req.method,
      stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  } else {
    logger.warn(`Client Error [${statusCode}]: ${message}`, {
      path: req.path,
      method: req.method,
    });
  }

  res.status(statusCode).json({
    error: message,
    ...(env.NODE_ENV === 'development' && statusCode >= 500 ? { stack: err.stack } : {}),
  });
}
