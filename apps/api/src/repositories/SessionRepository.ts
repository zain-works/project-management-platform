import { prisma } from '../config/database.js';
import { Session, User } from '@prisma/client';

export interface SessionWithUser extends Session {
  user: User;
}

export class SessionRepository {
  async create(data: {
    tokenHash: string;
    userId: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<Session> {
    return prisma.session.create({
      data,
    });
  }

  async findByTokenHash(tokenHash: string): Promise<SessionWithUser | null> {
    return prisma.session.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  async delete(tokenHash: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { tokenHash },
    });
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { userId },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    return result.count;
  }
}

export const sessionRepository = new SessionRepository();
