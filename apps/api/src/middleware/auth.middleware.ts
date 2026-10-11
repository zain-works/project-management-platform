import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/AuthService.js';
import { User } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user: User;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Check HTTP-only cookie
    let sessionToken = req.cookies?.pmp_session;

    // 2. Check Authorization header fallback (Bearer <token>)
    if (!sessionToken && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        sessionToken = parts[1];
      }
    }

    if (!sessionToken) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const user = await authService.validateSession(sessionToken);
    if (!user) {
      res.clearCookie('pmp_session');
      res.status(401).json({ error: 'Session expired or invalid' });
      return;
    }

    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    next(error);
  }
}
