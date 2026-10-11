import { notificationRepository } from '../repositories/NotificationRepository.js';

export class NotificationService {
  async listNotifications(userId: string, options?: { unreadOnly?: boolean; page?: number; limit?: number }) {
    return notificationRepository.findByRecipient(userId, options);
  }

  async countUnread(userId: string): Promise<number> {
    return notificationRepository.countUnread(userId);
  }

  async markAsRead(notificationId: string, userId: string) {
    return notificationRepository.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId: string) {
    return notificationRepository.markAllAsRead(userId);
  }
}

export const notificationService = new NotificationService();
