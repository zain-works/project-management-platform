import { outboxRepository } from '../../repositories/OutboxRepository.js';
import { eventDispatcher } from '../dispatcher/DomainEventDispatcher.js';
import { logger } from '../../utils/logger.js';
import { BaseDomainEvent } from '@pmp/shared';

export class OutboxWorker {
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private isRunning = false;
  private intervalMs: number;

  constructor(intervalMs = 3000) {
    this.intervalMs = intervalMs;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    logger.info('Outbox background worker started');
    this.scheduleNext();
  }

  stop(): void {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    logger.info('Outbox background worker stopped');
  }

  private scheduleNext(): void {
    if (!this.isRunning) return;
    this.timer = setTimeout(async () => {
      await this.processBatch();
      this.scheduleNext();
    }, this.intervalMs);
  }

  async processBatch(): Promise<number> {
    if (this.isProcessing) return 0;
    this.isProcessing = true;

    let processedCount = 0;
    try {
      const pendingEvents = await outboxRepository.fetchPending(20);
      for (const eventRecord of pendingEvents) {
        try {
          const domainEvent = eventRecord.payload as unknown as BaseDomainEvent<any>;
          // Dispatch to handlers
          await eventDispatcher.dispatch(domainEvent);
          await outboxRepository.markProcessed(eventRecord.id);
          processedCount++;
        } catch (err: unknown) {
          logger.error(`Error processing outbox event ${eventRecord.id}`, { error: String(err) });
          await outboxRepository.markFailed(eventRecord.id, eventRecord.attempts, String(err));
        }
      }
    } catch (err: unknown) {
      // In case DB is temporarily down or reconnecting, catch gracefully
      logger.debug('Outbox processor cycle skipped or DB unavailable', { error: String(err) });
    } finally {
      this.isProcessing = false;
    }

    return processedCount;
  }
}

export const outboxWorker = new OutboxWorker();
