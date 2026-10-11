import { prisma } from '../config/database.js';
import { OutboxEvent, Prisma } from '@prisma/client';

export class OutboxRepository {
  async create(
    eventType: string,
    payload: Prisma.InputJsonValue,
    tx?: Prisma.TransactionClient
  ): Promise<OutboxEvent> {
    const client = tx || prisma;
    return client.outboxEvent.create({
      data: {
        eventType,
        payload,
      },
    });
  }

  async fetchPending(batchSize = 20): Promise<OutboxEvent[]> {
    return prisma.outboxEvent.findMany({
      where: {
        isProcessed: false,
        availableAt: { lte: new Date() },
        attempts: { lt: 5 }, // Max 5 retry attempts
      },
      orderBy: { createdAt: 'asc' },
      take: batchSize,
    });
  }

  async markProcessed(id: string): Promise<OutboxEvent> {
    return prisma.outboxEvent.update({
      where: { id },
      data: {
        isProcessed: true,
        processedAt: new Date(),
      },
    });
  }

  async markFailed(id: string, attempts: number, error: string): Promise<OutboxEvent> {
    // Exponential backoff: 2^attempts * 5 seconds
    const backoffMs = Math.min(Math.pow(2, attempts) * 5000, 300000); // max 5 min
    const nextAvailableAt = new Date(Date.now() + backoffMs);

    return prisma.outboxEvent.update({
      where: { id },
      data: {
        attempts: attempts + 1,
        availableAt: nextAvailableAt,
        lastError: error.slice(0, 1000),
      },
    });
  }

  async hasReminderBeenSent(taskId: string, recipientId: string, reminderWindow: string): Promise<boolean> {
    const existing = await prisma.reminderTracking.findUnique({
      where: {
        taskId_recipientId_reminderWindow: {
          taskId,
          recipientId,
          reminderWindow,
        },
      },
    });
    return !!existing;
  }

  async recordReminderSent(taskId: string, recipientId: string, reminderWindow: string) {
    return prisma.reminderTracking.create({
      data: {
        taskId,
        recipientId,
        reminderWindow,
      },
    });
  }
}

export const outboxRepository = new OutboxRepository();
