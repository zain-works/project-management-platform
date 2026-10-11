import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/AuthService.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { env } from '../config/env.js';

function setSessionCookie(res: Response, token: string, rememberMe = false) {
  const maxAge = (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000;
  res.cookie('pmp_session', token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'lax',
    maxAge,
    path: '/',
  });
}

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.signup(req.body);
      setSessionCookie(res, result.sessionToken, false);
      res.status(201).json({
        user: result.user,
        token: result.sessionToken,
        message: 'Account created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, rememberMe } = req.body;
      const result = await authService.login(email, password, {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        rememberMe,
      });

      setSessionCookie(res, result.sessionToken, !!rememberMe);
      res.status(200).json({
        user: result.user,
        token: result.sessionToken,
        message: 'Signed in successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.pmp_session || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
      if (token) {
        await authService.logout(token);
      }
      res.clearCookie('pmp_session', { path: '/' });
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      res.status(200).json({
        user: {
          id: authReq.user.id,
          name: authReq.user.name,
          email: authReq.user.email,
          avatarUrl: authReq.user.avatarUrl,
          emailVerifiedAt: authReq.user.emailVerifiedAt,
          createdAt: authReq.user.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.forgotPassword(req.body.email);
      res.status(200).json({
        message: 'If an account exists with that email, a password reset link has been sent.',
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.resetPassword(req.body.token, req.body.password);
      res.status(200).json({
        message: 'Password reset successfully. Please log in with your new password.',
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.verifyEmail(req.body.token);
      res.status(200).json({
        message: 'Email address verified successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  async resendVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      await authService.resendVerification(authReq.user.id);
      res.status(200).json({
        message: 'Verification link resent to your email.',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const { name, avatarUrl } = req.body;
      const updatedUser = await authService.updateProfile(authReq.user.id, { name, avatarUrl });
      res.status(200).json({
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          avatarUrl: updatedUser.avatarUrl,
        },
        message: 'Profile updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(authReq.user.id, currentPassword, newPassword);
      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
