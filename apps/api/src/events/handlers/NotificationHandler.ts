import { BaseDomainEvent, NotificationType, TaskAssignedPayload, TaskStatusChangedPayload, CommentAddedPayload } from '@pmp/shared';
import { notificationRepository } from '../../repositories/NotificationRepository.js';
import { taskRepository } from '../../repositories/TaskRepository.js';
import { logger } from '../../utils/logger.js';

export async function handleTaskAssignedNotification(event: BaseDomainEvent<TaskAssignedPayload>) {
  const { newAssigneeId, taskTitle, assignedById, taskId, projectId } = event.payload;

  // Don't notify if unassigned or if the assigner assigned the task to themselves
  if (!newAssigneeId || newAssigneeId === assignedById) {
    return;
  }

  try {
    await notificationRepository.create({
      recipientId: newAssigneeId,
      type: NotificationType.TASK_ASSIGNED,
      title: 'New Task Assigned',
      body: `You were assigned to task: "${taskTitle}"`,
      resourceType: 'task',
      resourceId: taskId,
    });
    logger.info(`Notification created for user ${newAssigneeId}: Task Assigned`, { taskId, newAssigneeId });
  } catch (err) {
    logger.error('Failed to create TaskAssigned notification', { error: String(err), taskId, newAssigneeId });
  }
}

export async function handleTaskStatusChangedNotification(event: BaseDomainEvent<TaskStatusChangedPayload>) {
  const { taskId, taskTitle, oldStatus, newStatus, changedById } = event.payload;

  try {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      logger.warn('Task not found for status change notification', { taskId });
      return;
    }

    // Recipients: Creator and Assignee, excluding the person who made the change
    const recipients = new Set<string>();
    if (task.createdById && task.createdById !== changedById) {
      recipients.add(task.createdById);
    }
    if (task.assigneeId && task.assigneeId !== changedById) {
      recipients.add(task.assigneeId);
    }

    for (const recipientId of recipients) {
      await notificationRepository.create({
        recipientId,
        type: NotificationType.TASK_STATUS_CHANGED,
        title: 'Task Status Updated',
        body: `"${taskTitle}" status changed from ${oldStatus} to ${newStatus}`,
        resourceType: 'task',
        resourceId: taskId,
      });
    }
    logger.info(`TaskStatusChanged notifications created`, { taskId, recipientCount: recipients.size });
  } catch (err) {
    logger.error('Failed to create TaskStatusChanged notification', { error: String(err), taskId });
  }
}

export async function handleCommentAddedNotification(event: BaseDomainEvent<CommentAddedPayload>) {
  const { taskId, taskTitle, authorId, authorName, contentSnippet } = event.payload;

  try {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      logger.warn('Task not found for comment notification', { taskId });
      return;
    }

    const recipients = new Set<string>();
    if (task.createdById && task.createdById !== authorId) {
      recipients.add(task.createdById);
    }
    if (task.assigneeId && task.assigneeId !== authorId) {
      recipients.add(task.assigneeId);
    }

    for (const recipientId of recipients) {
      await notificationRepository.create({
        recipientId,
        type: NotificationType.COMMENT_ADDED,
        title: `New Comment on "${taskTitle}"`,
        body: `${authorName}: "${contentSnippet.slice(0, 80)}${contentSnippet.length > 80 ? '...' : ''}"`,
        resourceType: 'task',
        resourceId: taskId,
      });
    }
    logger.info(`CommentAdded notifications created`, { taskId, recipientCount: recipients.size });
  } catch (err) {
    logger.error('Failed to create CommentAdded notification', { error: String(err), taskId });
  }
}
