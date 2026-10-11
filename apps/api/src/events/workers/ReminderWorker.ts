import { taskRepository } from '../../repositories/TaskRepository.js';
import { outboxRepository } from '../../repositories/OutboxRepository.js';
import { notificationRepository } from '../../repositories/NotificationRepository.js';
import { NotificationType } from '@pmp/shared';
import { logger } from '../../utils/logger.js';

export class ReminderWorker {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private intervalMs: number;

  constructor(intervalMs = 60000) {
    this.intervalMs = intervalMs;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    logger.info('Due-date reminder worker started');
    this.scheduleNext();
  }

  stop(): void {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    logger.info('Due-date reminder worker stopped');
  }

  private scheduleNext(): void {
    if (!this.isRunning) return;
    this.timer = setTimeout(async () => {
      await this.processReminders();
      this.scheduleNext();
    }, this.intervalMs);
  }

  async processReminders(): Promise<number> {
    let sentCount = 0;
    try {
      const dueSoonTasks = await taskRepository.findDueSoon(24); // within 24h
      const reminderWindow = '24h';

      for (const task of dueSoonTasks) {
        if (!task.assigneeId) continue;

        const alreadySent = await outboxRepository.hasReminderBeenSent(
          task.id,
          task.assigneeId,
          reminderWindow
        );

        if (!alreadySent) {
          // Send notification
          await notificationRepository.create({
            recipientId: task.assigneeId,
            type: NotificationType.TASK_DUE_SOON,
            title: 'Task Due Soon',
            body: `Reminder: "${task.title}" is due soon.`,
            resourceType: 'task',
            resourceId: task.id,
          });

          // Record tracking to prevent duplicate notifications
          await outboxRepository.recordReminderSent(task.id, task.assigneeId, reminderWindow);
          sentCount++;
          logger.info(`Due reminder sent for task ${task.id} to user ${task.assigneeId}`);
        }
      }
    } catch (err) {
      logger.debug('Reminder worker cycle skipped or DB error', { error: String(err) });
    }
    return sentCount;
  }
}

export const reminderWorker = new ReminderWorker();
