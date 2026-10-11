import { BaseDomainEvent, DomainEventType } from '@pmp/shared';
import { outboxRepository } from '../../repositories/OutboxRepository.js';
import { logger } from '../../utils/logger.js';
import { Prisma } from '@prisma/client';

export type DomainEventHandler<T = any> = (event: BaseDomainEvent<T>) => Promise<void> | void;

export class DomainEventDispatcher {
  private handlers = new Map<DomainEventType, DomainEventHandler[]>();

  register<T = any>(eventType: DomainEventType, handler: DomainEventHandler<T>): void {
    const existing = this.handlers.get(eventType) || [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
  }

  /**
   * Enqueues an event to the Transactional Outbox table within a database transaction.
   * This guarantees that the event is committed if and only if the primary transaction commits.
   */
  async enqueueToOutbox<T>(
    event: BaseDomainEvent<T>,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    try {
      await outboxRepository.create(event.eventType, event as any, tx);
      logger.debug(`Enqueued outbox event [${event.eventType}]`, { id: event.id });
    } catch (error) {
      logger.error(`Failed to enqueue outbox event [${event.eventType}]`, { error: String(error) });
      throw error;
    }
  }

  /**
   * Dispatches an event directly to all registered in-memory handlers.
   * Handlers run safely with individual try/catch boundaries so one failure does not crash others.
   */
  async dispatch<T>(event: BaseDomainEvent<T>): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || [];
    if (handlers.length === 0) {
      return;
    }

    logger.info(`Dispatching event [${event.eventType}] to ${handlers.length} handler(s)`, {
      eventId: event.id,
      actorId: event.actorId,
    });

    const promises = handlers.map(async (handler) => {
      try {
        await handler(event);
      } catch (err) {
        logger.error(`Error in event handler for [${event.eventType}]`, {
          eventId: event.id,
          error: String(err),
        });
      }
    });

    await Promise.allSettled(promises);
  }
}

export const eventDispatcher = new DomainEventDispatcher();
