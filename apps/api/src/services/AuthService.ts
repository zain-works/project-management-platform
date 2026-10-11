import { userRepository } from '../repositories/UserRepository.js';
import { sessionRepository } from '../repositories/SessionRepository.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateRandomToken, hashToken } from '../utils/tokens.js';
import { eventDispatcher } from '../events/dispatcher/DomainEventDispatcher.js';
import { createDomainEvent } from '../events/definitions/events.js';
import { User } from '@prisma/client';

export interface AuthSessionResult {
  user: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl' | 'emailVerifiedAt'>;
  sessionToken: string;
}

export class AuthService {
  async signup(data: { name: string; email: string; password: string }): Promise<AuthSessionResult> {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      const error: any = new Error('An account with this email address already exists');
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await hashPassword(data.password);
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
    });

    // Create Email Verification Token
    const rawVerificationToken = generateRandomToken();
    const tokenHash = hashToken(rawVerificationToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await userRepository.createVerificationToken(user.id, tokenHash, expiresAt);

    // Publish UserRegistered & EmailVerificationRequested events
    const regEvent = createDomainEvent('UserRegistered', {
      userId: user.id,
      email: user.email,
      name: user.name,
    }, { actorId: user.id });
    await eventDispatcher.dispatch(regEvent);

    const emailVerifyEvent = createDomainEvent('EmailVerificationRequested', {
      userId: user.id,
      email: user.email,
      name: user.name,
      token: rawVerificationToken,
    }, { actorId: user.id });
    await eventDispatcher.dispatch(emailVerifyEvent);

    // Create initial session so user is immediately logged in
    const sessionToken = generateRandomToken();
    const sessionHash = hashToken(sessionToken);
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await sessionRepository.create({
      tokenHash: sessionHash,
      userId: user.id,
      expiresAt: sessionExpiry,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        emailVerifiedAt: user.emailVerifiedAt,
      },
      sessionToken,
    };
  }

  async login(
    email: string,
    password: string,
    meta?: { userAgent?: string; ipAddress?: string; rememberMe?: boolean }
  ): Promise<AuthSessionResult> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Generate Session Token
    const sessionToken = generateRandomToken();
    const tokenHash = hashToken(sessionToken);
    const days = meta?.rememberMe ? 30 : 7;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await sessionRepository.create({
      tokenHash,
      userId: user.id,
      expiresAt,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        emailVerifiedAt: user.emailVerifiedAt,
      },
      sessionToken,
    };
  }

  async logout(sessionToken: string): Promise<void> {
    const tokenHash = hashToken(sessionToken);
    await sessionRepository.delete(tokenHash);
  }

  async validateSession(sessionToken: string): Promise<User | null> {
    const tokenHash = hashToken(sessionToken);
    const session = await sessionRepository.findByTokenHash(tokenHash);
    if (!session) return null;

    if (session.expiresAt < new Date()) {
      await sessionRepository.delete(tokenHash);
      return null;
    }

    return session.user;
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Do not reveal whether user exists for security
      return;
    }

    const rawToken = generateRandomToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await userRepository.createPasswordResetToken(user.id, tokenHash, expiresAt);

    // Import mailer directly for password reset flow
    const { mailer } = await import('../config/mailer.js');
    await mailer.sendPasswordResetEmail(user.email, rawToken, user.name);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = hashToken(token);
    const resetRecord = await userRepository.findPasswordResetToken(tokenHash);

    if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
      const error: any = new Error('Password reset link is invalid or has expired');
      error.statusCode = 400;
      throw error;
    }

    const passwordHash = await hashPassword(newPassword);
    await userRepository.updatePassword(resetRecord.userId, passwordHash);
    await userRepository.markPasswordResetTokenUsed(resetRecord.id);

    // Invalidate all existing sessions for security
    await sessionRepository.deleteAllForUser(resetRecord.userId);
  }

  async verifyEmail(token: string): Promise<void> {
    const tokenHash = hashToken(token);
    const tokenRecord = await userRepository.findVerificationToken(tokenHash);

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      const error: any = new Error('Verification link is invalid or has expired');
      error.statusCode = 400;
      throw error;
    }

    await userRepository.verifyEmail(tokenRecord.userId);
    await userRepository.deleteVerificationToken(tokenRecord.id);
  }

  async resendVerification(userId: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user || user.emailVerifiedAt) return;

    const rawToken = generateRandomToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await userRepository.createVerificationToken(user.id, tokenHash, expiresAt);

    const emailVerifyEvent = createDomainEvent('EmailVerificationRequested', {
      userId: user.id,
      email: user.email,
      name: user.name,
      token: rawToken,
    }, { actorId: user.id });
    await eventDispatcher.dispatch(emailVerifyEvent);
  }

  async updateProfile(userId: string, data: { name?: string; avatarUrl?: string }) {
    return userRepository.update(userId, data);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const isValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isValid) {
      const error: any = new Error('Current password is incorrect');
      error.statusCode = 400;
      throw error;
    }

    const newHash = await hashPassword(newPassword);
    await userRepository.updatePassword(userId, newHash);
  }
}

export const authService = new AuthService();
