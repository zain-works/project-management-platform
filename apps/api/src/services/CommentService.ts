import { commentRepository } from '../repositories/CommentRepository.js';
import { taskRepository } from '../repositories/TaskRepository.js';
import { projectRepository } from '../repositories/ProjectRepository.js';
import { workspaceRepository } from '../repositories/WorkspaceRepository.js';
import { userRepository } from '../repositories/UserRepository.js';
import { eventDispatcher } from '../events/dispatcher/DomainEventDispatcher.js';
import { createDomainEvent } from '../events/definitions/events.js';
import { WorkspaceRole, hasMinimumRole } from '@pmp/shared';

export class CommentService {
  async createComment(taskId: string, userId: string, content: string) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      const error: any = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    const project = await projectRepository.findById(task.projectId);
    if (!project) {
      const error: any = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    const membership = await workspaceRepository.findMember(project.workspaceId, userId);
    if (!membership) {
      const error: any = new Error('Access denied to comment on this task');
      error.statusCode = 403;
      throw error;
    }

    const user = await userRepository.findById(userId);
    const comment = await commentRepository.create({
      taskId,
      authorId: userId,
      content,
    });

    const event = createDomainEvent('CommentAdded', {
      commentId: comment.id,
      taskId,
      projectId: project.id,
      workspaceId: project.workspaceId,
      taskTitle: task.title,
      authorId: userId,
      authorName: user?.name || 'Unknown Member',
      contentSnippet: content,
    }, { actorId: userId, workspaceId: project.workspaceId });
    await eventDispatcher.dispatch(event);

    return comment;
  }

  async listComments(taskId: string, userId: string) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      const error: any = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    const project = await projectRepository.findById(task.projectId);
    if (!project) {
      const error: any = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    const membership = await workspaceRepository.findMember(project.workspaceId, userId);
    if (!membership) {
      const error: any = new Error('Access denied to view comments');
      error.statusCode = 403;
      throw error;
    }

    return commentRepository.findByTaskId(taskId);
  }

  async updateComment(commentId: string, userId: string, content: string) {
    const comment = await commentRepository.findById(commentId);
    if (!comment || comment.deletedAt) {
      const error: any = new Error('Comment not found');
      error.statusCode = 404;
      throw error;
    }

    if (comment.authorId !== userId) {
      const error: any = new Error('You can only edit your own comments');
      error.statusCode = 403;
      throw error;
    }

    return commentRepository.update(commentId, content);
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await commentRepository.findById(commentId);
    if (!comment || comment.deletedAt) {
      const error: any = new Error('Comment not found');
      error.statusCode = 404;
      throw error;
    }

    const task = await taskRepository.findById(comment.taskId);
    if (!task) {
      const error: any = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    const project = await projectRepository.findById(task.projectId);
    if (!project) {
      const error: any = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    const membership = await workspaceRepository.findMember(project.workspaceId, userId);
    // Allowed if author or admin/owner of workspace
    const isAuthor = comment.authorId === userId;
    const isAdmin = membership && hasMinimumRole(membership.role as WorkspaceRole, WorkspaceRole.ADMIN);

    if (!isAuthor && !isAdmin) {
      const error: any = new Error('Insufficient permissions to delete this comment');
      error.statusCode = 403;
      throw error;
    }

    return commentRepository.softDelete(commentId);
  }
}

export const commentService = new CommentService();
