import { taskRepository, TaskFilterOptions } from '../repositories/TaskRepository.js';
import { projectRepository } from '../repositories/ProjectRepository.js';
import { workspaceRepository } from '../repositories/WorkspaceRepository.js';
import { eventDispatcher } from '../events/dispatcher/DomainEventDispatcher.js';
import { createDomainEvent } from '../events/definitions/events.js';
import { TaskStatus, TaskPriority, WorkspaceRole, hasMinimumRole } from '@pmp/shared';

export class TaskService {
  async createTask(
    projectId: string,
    userId: string,
    data: {
      title: string;
      description?: string | null;
      status?: TaskStatus;
      priority?: TaskPriority;
      assigneeId?: string | null;
      dueDate?: string | null;
      position?: number;
    }
  ) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      const error: any = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    const membership = await workspaceRepository.findMember(project.workspaceId, userId);
    if (!membership) {
      const error: any = new Error('Access denied to project');
      error.statusCode = 403;
      throw error;
    }

    // If assigneeId is provided, verify assignee belongs to the workspace
    if (data.assigneeId) {
      const assigneeMembership = await workspaceRepository.findMember(project.workspaceId, data.assigneeId);
      if (!assigneeMembership) {
        const error: any = new Error('Assignee is not a member of this workspace');
        error.statusCode = 400;
        throw error;
      }
    }

    const task = await taskRepository.create({
      projectId,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assigneeId: data.assigneeId,
      createdById: userId,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      position: data.position ?? 0,
    });

    const createdEvent = createDomainEvent('TaskCreated', {
      taskId: task.id,
      projectId,
      workspaceId: project.workspaceId,
      title: task.title,
      createdById: userId,
      assigneeId: task.assigneeId,
      status: task.status as TaskStatus,
      priority: task.priority as TaskPriority,
    }, { actorId: userId, workspaceId: project.workspaceId });
    await eventDispatcher.dispatch(createdEvent);

    if (task.assigneeId) {
      const assignedEvent = createDomainEvent('TaskAssigned', {
        taskId: task.id,
        projectId,
        workspaceId: project.workspaceId,
        taskTitle: task.title,
        previousAssigneeId: null,
        newAssigneeId: task.assigneeId,
        assignedById: userId,
      }, { actorId: userId, workspaceId: project.workspaceId });
      await eventDispatcher.dispatch(assignedEvent);
    }

    return taskRepository.findById(task.id);
  }

  async listTasks(projectId: string, userId: string, options?: TaskFilterOptions) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      const error: any = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    const membership = await workspaceRepository.findMember(project.workspaceId, userId);
    if (!membership) {
      const error: any = new Error('Access denied to project');
      error.statusCode = 403;
      throw error;
    }

    return taskRepository.findByProject(projectId, options);
  }

  async getTaskById(taskId: string, userId: string) {
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
      const error: any = new Error('Access denied to task');
      error.statusCode = 403;
      throw error;
    }

    return {
      ...task,
      project: {
        id: project.id,
        name: project.name,
        workspaceId: project.workspaceId,
      },
    };
  }

  async updateTask(
    taskId: string,
    userId: string,
    data: {
      title?: string;
      description?: string | null;
      status?: TaskStatus;
      priority?: TaskPriority;
      assigneeId?: string | null;
      dueDate?: string | null;
      position?: number;
    }
  ) {
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
      const error: any = new Error('Access denied to modify task');
      error.statusCode = 403;
      throw error;
    }

    // Validate assignee if changed
    if (data.assigneeId !== undefined && data.assigneeId !== null && data.assigneeId !== task.assigneeId) {
      const assigneeMembership = await workspaceRepository.findMember(project.workspaceId, data.assigneeId);
      if (!assigneeMembership) {
        const error: any = new Error('Assignee is not a member of this workspace');
        error.statusCode = 400;
        throw error;
      }
    }

    const updatePayload: any = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.priority !== undefined) updatePayload.priority = data.priority;
    if (data.assigneeId !== undefined) updatePayload.assigneeId = data.assigneeId;
    if (data.dueDate !== undefined) updatePayload.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.position !== undefined) updatePayload.position = data.position;

    const updatedTask = await taskRepository.update(taskId, updatePayload);

    // Domain events for specific changes:
    if (data.status && data.status !== task.status) {
      const statusEvent = createDomainEvent('TaskStatusChanged', {
        taskId: task.id,
        projectId: task.projectId,
        workspaceId: project.workspaceId,
        taskTitle: updatedTask.title,
        oldStatus: task.status as TaskStatus,
        newStatus: data.status,
        changedById: userId,
        assigneeId: updatedTask.assigneeId,
      }, { actorId: userId, workspaceId: project.workspaceId });
      await eventDispatcher.dispatch(statusEvent);

      if (data.status === TaskStatus.DONE) {
        const completedEvent = createDomainEvent('TaskCompleted', {
          taskId: task.id,
          projectId: task.projectId,
          workspaceId: project.workspaceId,
          taskTitle: updatedTask.title,
          completedById: userId,
        }, { actorId: userId, workspaceId: project.workspaceId });
        await eventDispatcher.dispatch(completedEvent);
      }
    }

    if (data.assigneeId !== undefined && data.assigneeId !== task.assigneeId) {
      const assignEvent = createDomainEvent('TaskAssigned', {
        taskId: task.id,
        projectId: task.projectId,
        workspaceId: project.workspaceId,
        taskTitle: updatedTask.title,
        previousAssigneeId: task.assigneeId,
        newAssigneeId: data.assigneeId,
        assignedById: userId,
      }, { actorId: userId, workspaceId: project.workspaceId });
      await eventDispatcher.dispatch(assignEvent);
    }

    if (data.priority && data.priority !== task.priority) {
      const priorityEvent = createDomainEvent('TaskPriorityChanged', {
        taskId: task.id,
        projectId: task.projectId,
        workspaceId: project.workspaceId,
        taskTitle: updatedTask.title,
        oldPriority: task.priority as TaskPriority,
        newPriority: data.priority,
        changedById: userId,
      }, { actorId: userId, workspaceId: project.workspaceId });
      await eventDispatcher.dispatch(priorityEvent);
    }

    if (data.dueDate !== undefined) {
      const oldDue = task.dueDate ? task.dueDate.toISOString() : null;
      const newDue = data.dueDate || null;
      if (oldDue !== newDue) {
        const dueEvent = createDomainEvent('TaskDueDateChanged', {
          taskId: task.id,
          projectId: task.projectId,
          workspaceId: project.workspaceId,
          taskTitle: updatedTask.title,
          oldDueDate: oldDue,
          newDueDate: newDue,
          changedById: userId,
        }, { actorId: userId, workspaceId: project.workspaceId });
        await eventDispatcher.dispatch(dueEvent);
      }
    }

    return taskRepository.findById(taskId);
  }

  async updateTaskStatus(taskId: string, userId: string, status: TaskStatus, position?: number) {
    return this.updateTask(taskId, userId, { status, position });
  }

  async updateTaskAssignee(taskId: string, userId: string, assigneeId: string | null) {
    return this.updateTask(taskId, userId, { assigneeId });
  }

  async deleteTask(taskId: string, userId: string) {
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
    if (!membership || !hasMinimumRole(membership.role as WorkspaceRole, WorkspaceRole.PROJECT_MANAGER)) {
      // Only PM+ or Task Creator can delete
      if (task.createdById !== userId) {
        const error: any = new Error('Only the creator, project managers, or workspace admins can delete tasks');
        error.statusCode = 403;
        throw error;
      }
    }

    return taskRepository.delete(taskId);
  }

  async getMyTasks(userId: string, workspaceId?: string) {
    return taskRepository.findAssignedToUser(userId, workspaceId);
  }
}

export const taskService = new TaskService();
