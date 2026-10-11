import { projectRepository } from '../repositories/ProjectRepository.js';
import { workspaceRepository } from '../repositories/WorkspaceRepository.js';
import { activityLogRepository } from '../repositories/ActivityLogRepository.js';
import { eventDispatcher } from '../events/dispatcher/DomainEventDispatcher.js';
import { createDomainEvent } from '../events/definitions/events.js';
import { ProjectStatus, WorkspaceRole, hasMinimumRole } from '@pmp/shared';

export class ProjectService {
  async createProject(
    workspaceId: string,
    userId: string,
    data: {
      name: string;
      description?: string | null;
      status?: ProjectStatus;
      startDate?: string | null;
      dueDate?: string | null;
    }
  ) {
    const membership = await workspaceRepository.findMember(workspaceId, userId);
    if (!membership || !hasMinimumRole(membership.role as WorkspaceRole, WorkspaceRole.PROJECT_MANAGER)) {
      const error: any = new Error('Only Project Managers, Admins, or Owners can create projects');
      error.statusCode = 403;
      throw error;
    }

    const project = await projectRepository.create({
      workspaceId,
      name: data.name,
      description: data.description,
      status: data.status,
      createdById: userId,
      startDate: data.startDate ? new Date(data.startDate) : null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    });

    const event = createDomainEvent('ProjectCreated', {
      projectId: project.id,
      workspaceId,
      name: project.name,
      createdById: userId,
    }, { actorId: userId, workspaceId });
    await eventDispatcher.dispatch(event);

    return project;
  }

  async listProjects(
    workspaceId: string,
    userId: string,
    options?: { status?: ProjectStatus; search?: string }
  ) {
    const membership = await workspaceRepository.findMember(workspaceId, userId);
    if (!membership) {
      const error: any = new Error('Access denied to workspace projects');
      error.statusCode = 403;
      throw error;
    }

    return projectRepository.listByWorkspace(workspaceId, options);
  }

  async getProjectById(projectId: string, userId: string) {
    const project = await projectRepository.findWithStats(projectId);
    if (!project) {
      const error: any = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify workspace membership
    const membership = await workspaceRepository.findMember(project.workspaceId, userId);
    if (!membership) {
      const error: any = new Error('Access denied to project');
      error.statusCode = 403;
      throw error;
    }

    return project;
  }

  async updateProject(
    projectId: string,
    userId: string,
    data: {
      name?: string;
      description?: string | null;
      status?: ProjectStatus;
      startDate?: string | null;
      dueDate?: string | null;
    }
  ) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      const error: any = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    const membership = await workspaceRepository.findMember(project.workspaceId, userId);
    if (!membership || !hasMinimumRole(membership.role as WorkspaceRole, WorkspaceRole.PROJECT_MANAGER)) {
      const error: any = new Error('Only Project Managers, Admins, or Owners can update project settings');
      error.statusCode = 403;
      throw error;
    }

    const updatePayload: any = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.startDate !== undefined) updatePayload.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.dueDate !== undefined) updatePayload.dueDate = data.dueDate ? new Date(data.dueDate) : null;

    const updated = await projectRepository.update(projectId, updatePayload);

    const event = createDomainEvent('ProjectUpdated', {
      projectId: updated.id,
      workspaceId: updated.workspaceId,
      changes: updatePayload,
    }, { actorId: userId, workspaceId: updated.workspaceId });
    await eventDispatcher.dispatch(event);

    return updated;
  }

  async archiveProject(projectId: string, userId: string) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      const error: any = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    const membership = await workspaceRepository.findMember(project.workspaceId, userId);
    if (!membership || !hasMinimumRole(membership.role as WorkspaceRole, WorkspaceRole.PROJECT_MANAGER)) {
      const error: any = new Error('Only Project Managers, Admins, or Owners can archive projects');
      error.statusCode = 403;
      throw error;
    }

    return projectRepository.archive(projectId);
  }

  async getProjectActivity(projectId: string, userId: string, options?: { page?: number; limit?: number }) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      const error: any = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    const membership = await workspaceRepository.findMember(project.workspaceId, userId);
    if (!membership) {
      const error: any = new Error('Access denied to project activity');
      error.statusCode = 403;
      throw error;
    }

    return activityLogRepository.listByProject(projectId, options);
  }
}

export const projectService = new ProjectService();
