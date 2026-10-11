import { Router } from 'express';
import { authController } from '../controllers/AuthController.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@pmp/shared';

const router = Router();

router.post('/signup', authLimiter, validateBody(signupSchema), (req, res, next) => authController.signup(req, res, next));
router.post('/login', authLimiter, validateBody(loginSchema), (req, res, next) => authController.login(req, res, next));
router.post('/logout', (req, res, next) => authController.logout(req, res, next));
router.get('/me', requireAuth, (req, res, next) => authController.me(req, res, next));

router.post('/forgot-password', authLimiter, validateBody(forgotPasswordSchema), (req, res, next) =>
  authController.forgotPassword(req, res, next)
);
router.post('/reset-password', authLimiter, validateBody(resetPasswordSchema), (req, res, next) =>
  authController.resetPassword(req, res, next)
);
router.post('/verify-email', (req, res, next) => authController.verifyEmail(req, res, next));
router.post('/resend-verification', requireAuth, (req, res, next) =>
  authController.resendVerification(req, res, next)
);
router.patch('/profile', requireAuth, (req, res, next) => authController.updateProfile(req, res, next));
router.post('/change-password', requireAuth, (req, res, next) => authController.changePassword(req, res, next));

export default router;
