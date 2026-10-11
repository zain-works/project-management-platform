import { describe, it, expect, vi } from 'vitest';
import { DomainEventDispatcher } from '../../events/dispatcher/DomainEventDispatcher.js';
import { createDomainEvent } from '../../events/definitions/events.js';
import { TaskStatus, TaskPriority } from '@pmp/shared';

describe('Event-Driven Architecture Dispatcher', () => {
  it('dispatches typed domain events to registered handlers', async () => {
    const dispatcher = new DomainEventDispatcher();
    const mockHandler = vi.fn();

    dispatcher.register('TaskCreated', mockHandler);

    const event = createDomainEvent('TaskCreated', {
      taskId: 'test-task-1',
      projectId: 'test-project-1',
      workspaceId: 'test-ws-1',
      title: 'Build Authentication',
      createdById: 'user-1',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
    }, { actorId: 'user-1', workspaceId: 'test-ws-1' });

    await dispatcher.dispatch(event);

    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockHandler).toHaveBeenCalledWith(event);
  });

  it('isolates handler errors and prevents execution failures from propagating', async () => {
    const dispatcher = new DomainEventDispatcher();
    const failingHandler = vi.fn().mockRejectedValue(new Error('SMTP connection lost'));
    const successHandler = vi.fn();

    dispatcher.register('WorkspaceCreated', failingHandler);
    dispatcher.register('WorkspaceCreated', successHandler);

    const event = createDomainEvent('WorkspaceCreated', {
      workspaceId: 'ws-1',
      ownerId: 'user-1',
      name: 'Test Workspace',
      slug: 'test-workspace',
    });

    // Should not throw even though failingHandler rejected
    await expect(dispatcher.dispatch(event)).resolves.not.toThrow();

    expect(failingHandler).toHaveBeenCalledTimes(1);
    expect(successHandler).toHaveBeenCalledTimes(1);
  });
});
