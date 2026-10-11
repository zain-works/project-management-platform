import { prisma } from '../config/database.js';
import { Notification, NotificationType } from '@prisma/client';

export class NotificationRepository {
  async create(data: {
    recipientId: string;
    type: NotificationType;
    title: string;
    body: string;
    resourceType?: string | null;
    resourceId?: string | null;
  }): Promise<Notification> {
    return prisma.notification.create({
      data,
    });
  }

  async findByRecipient(
    recipientId: string,
    options?: { unreadOnly?: boolean; page?: number; limit?: number }
  ): Promise<{ notifications: Notification[]; total: number }> {
    const where: any = { recipientId };
    if (options?.unreadOnly) {
      where.readAt = null;
    }

    const total = await prisma.notification.count({ where });

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return { notifications, total };
  }

  async countUnread(recipientId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        recipientId,
        readAt: null,
      },
    });
  }

  async markAsRead(id: string, recipientId: string): Promise<Notification> {
    return prisma.notification.update({
      where: { id, recipientId },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(recipientId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: {
        recipientId,
        readAt: null,
      },
      data: { readAt: new Date() },
    });
    return result.count;
  }
}

export const notificationRepository = new NotificationRepository();
