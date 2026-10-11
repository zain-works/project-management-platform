import {
  BaseDomainEvent,
  ActivityAction,
  TaskCreatedPayload,
  TaskAssignedPayload,
  TaskStatusChangedPayload,
  TaskPriorityChangedPayload,
  TaskDueDateChangedPayload,
  TaskCompletedPayload,
  CommentAddedPayload,
  ProjectCreatedPayload,
  ProjectUpdatedPayload,
  WorkspaceCreatedPayload,
  WorkspaceMemberJoinedPayload,
} from '@pmp/shared';
import { activityLogRepository } from '../../repositories/ActivityLogRepository.js';
import { logger } from '../../utils/logger.js';

export async function handleActivityLogging(event: BaseDomainEvent<any>) {
  try {
    const { eventType, actorId, workspaceId, payload } = event;
    if (!workspaceId) return;

    let actionType: string = eventType;
    let resourceType: string = 'unknown';
    let resourceId: string = '';
    let projectId: string | null = null;
    let safeMetadata: Record<string, unknown> = {};

    switch (eventType) {
      case 'WorkspaceCreated': {
        const p = payload as WorkspaceCreatedPayload;
        actionType = ActivityAction.WORKSPACE_CREATED;
        resourceType = 'workspace';
        resourceId = p.workspaceId;
        safeMetadata = { name: p.name, slug: p.slug };
        break;
      }
      case 'WorkspaceMemberJoined': {
        const p = payload as WorkspaceMemberJoinedPayload;
        actionType = ActivityAction.MEMBER_JOINED;
        resourceType = 'user';
        resourceId = p.userId;
        safeMetadata = { role: p.role };
        break;
      }
      case 'ProjectCreated': {
        const p = payload as ProjectCreatedPayload;
        actionType = ActivityAction.PROJECT_CREATED;
        resourceType = 'project';
        resourceId = p.projectId;
        projectId = p.projectId;
        safeMetadata = { name: p.name };
        break;
      }
      case 'ProjectUpdated': {
        const p = payload as ProjectUpdatedPayload;
        actionType = ActivityAction.PROJECT_UPDATED;
        resourceType = 'project';
        resourceId = p.projectId;
        projectId = p.projectId;
        safeMetadata = { changes: p.changes };
        break;
      }
      case 'TaskCreated': {
        const p = payload as TaskCreatedPayload;
        actionType = ActivityAction.TASK_CREATED;
        resourceType = 'task';
        resourceId = p.taskId;
        projectId = p.projectId;
        safeMetadata = { title: p.title, status: p.status, priority: p.priority };
        break;
      }
      case 'TaskAssigned': {
        const p = payload as TaskAssignedPayload;
        actionType = ActivityAction.TASK_ASSIGNED;
        resourceType = 'task';
        resourceId = p.taskId;
        projectId = p.projectId;
        safeMetadata = {
          taskTitle: p.taskTitle,
          newAssigneeId: p.newAssigneeId,
          previousAssigneeId: p.previousAssigneeId,
        };
        break;
      }
      case 'TaskStatusChanged': {
        const p = payload as TaskStatusChangedPayload;
        actionType = ActivityAction.TASK_STATUS_CHANGED;
        resourceType = 'task';
        resourceId = p.taskId;
        projectId = p.projectId;
        safeMetadata = {
          taskTitle: p.taskTitle,
          oldStatus: p.oldStatus,
          newStatus: p.newStatus,
        };
        break;
      }
      case 'TaskPriorityChanged': {
        const p = payload as TaskPriorityChangedPayload;
        actionType = ActivityAction.TASK_PRIORITY_CHANGED;
        resourceType = 'task';
        resourceId = p.taskId;
        projectId = p.projectId;
        safeMetadata = {
          taskTitle: p.taskTitle,
          oldPriority: p.oldPriority,
          newPriority: p.newPriority,
        };
        break;
      }
      case 'TaskDueDateChanged': {
        const p = payload as TaskDueDateChangedPayload;
        actionType = ActivityAction.TASK_DUE_DATE_CHANGED;
        resourceType = 'task';
        resourceId = p.taskId;
        projectId = p.projectId;
        safeMetadata = {
          taskTitle: p.taskTitle,
          oldDueDate: p.oldDueDate,
          newDueDate: p.newDueDate,
        };
        break;
      }
      case 'TaskCompleted': {
        const p = payload as TaskCompletedPayload;
        actionType = ActivityAction.TASK_COMPLETED;
        resourceType = 'task';
        resourceId = p.taskId;
        projectId = p.projectId;
        safeMetadata = { taskTitle: p.taskTitle };
        break;
      }
      case 'CommentAdded': {
        const p = payload as CommentAddedPayload;
        actionType = ActivityAction.COMMENT_ADDED;
        resourceType = 'comment';
        resourceId = p.commentId;
        projectId = p.projectId;
        safeMetadata = {
          taskTitle: p.taskTitle,
          authorName: p.authorName,
          snippet: p.contentSnippet.slice(0, 100),
        };
        break;
      }
      default:
        return;
    }

    await activityLogRepository.create({
      workspaceId,
      projectId,
      actorId,
      actionType,
      resourceType,
      resourceId,
      metadata: safeMetadata as any,
    });
  } catch (err) {
    logger.error('Failed to log activity event', { error: String(err) });
  }
}
