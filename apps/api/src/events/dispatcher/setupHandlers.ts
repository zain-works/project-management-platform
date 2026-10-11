import { eventDispatcher } from './DomainEventDispatcher.js';
import {
  handleTaskAssignedNotification,
  handleTaskStatusChangedNotification,
  handleCommentAddedNotification,
} from '../handlers/NotificationHandler.js';
import { handleActivityLogging } from '../handlers/ActivityLogHandler.js';
import { handleEmailVerification, handleWorkspaceInvitationEmail } from '../handlers/EmailHandler.js';

let isInitialized = false;

export function initializeEventHandlers(): void {
  if (isInitialized) return;
  isInitialized = true;

  // Notification handlers
  eventDispatcher.register('TaskAssigned', handleTaskAssignedNotification);
  eventDispatcher.register('TaskStatusChanged', handleTaskStatusChangedNotification);
  eventDispatcher.register('CommentAdded', handleCommentAddedNotification);

  // Activity Log handlers (listens to all major state events)
  const activityEvents = [
    'WorkspaceCreated',
    'WorkspaceMemberJoined',
    'ProjectCreated',
    'ProjectUpdated',
    'TaskCreated',
    'TaskAssigned',
    'TaskStatusChanged',
    'TaskPriorityChanged',
    'TaskDueDateChanged',
    'TaskCompleted',
    'CommentAdded',
  ] as const;

  for (const eventName of activityEvents) {
    eventDispatcher.register(eventName, handleActivityLogging);
  }

  // Email handlers
  eventDispatcher.register('EmailVerificationRequested', handleEmailVerification);
  eventDispatcher.register('WorkspaceMemberInvited', handleWorkspaceInvitationEmail);
}
