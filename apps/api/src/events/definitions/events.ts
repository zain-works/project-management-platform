import {
  DomainEventType,
  BaseDomainEvent,
  UserRegisteredPayload,
  WorkspaceCreatedPayload,
  WorkspaceMemberInvitedPayload,
  WorkspaceMemberJoinedPayload,
  ProjectCreatedPayload,
  ProjectUpdatedPayload,
  TaskCreatedPayload,
  TaskAssignedPayload,
  TaskStatusChangedPayload,
  TaskPriorityChangedPayload,
  TaskDueDateChangedPayload,
  CommentAddedPayload,
  TaskCompletedPayload,
  NotificationCreatedPayload,
} from '@pmp/shared';
import crypto from 'crypto';

export function createDomainEvent<T = Record<string, unknown>>(
  eventType: DomainEventType,
  payload: T,
  meta?: { actorId?: string | null; workspaceId?: string }
): BaseDomainEvent<T> {
  return {
    id: crypto.randomUUID(),
    eventType,
    timestamp: new Date().toISOString(),
    actorId: meta?.actorId,
    workspaceId: meta?.workspaceId,
    payload,
  };
}
