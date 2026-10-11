import { prisma } from '../config/database.js';
import { Project, ProjectMembership, ProjectRole, ProjectStatus, User, TaskStatus } from '@prisma/client';

export interface ProjectWithStats extends Project {
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
  membersCount: number;
  createdBy: Pick<User, 'id' | 'name' | 'email'>;
}

export class ProjectRepository {
  async create(data: {
    workspaceId: string;
    name: string;
    description?: string | null;
    status?: ProjectStatus;
    createdById: string;
    startDate?: Date | null;
    dueDate?: Date | null;
  }): Promise<Project> {
    return prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          workspaceId: data.workspaceId,
          name: data.name,
          description: data.description,
          status: data.status || ProjectStatus.ACTIVE,
          createdById: data.createdById,
          startDate: data.startDate,
          dueDate: data.dueDate,
        },
      });

      // Add creator as MANAGER in project
      await tx.projectMembership.create({
        data: {
          projectId: project.id,
          userId: data.createdById,
          role: ProjectRole.MANAGER,
        },
      });

      return project;
    });
  }

  async findById(id: string): Promise<Project | null> {
    return prisma.project.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findWithStats(id: string): Promise<ProjectWithStats | null> {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        tasks: {
          select: { status: true },
        },
        _count: {
          select: { memberships: true },
        },
      },
    });

    if (!project) return null;

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter((t) => t.status === TaskStatus.DONE).length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const { tasks, _count, ...rest } = project;
    return {
      ...rest,
      totalTasks,
      completedTasks,
      progressPercentage,
      membersCount: _count.memberships,
    };
  }

  async listByWorkspace(
    workspaceId: string,
    options?: { status?: ProjectStatus; search?: string; includeArchived?: boolean }
  ): Promise<ProjectWithStats[]> {
    const where: any = {
      workspaceId,
      ...(options?.includeArchived ? {} : { archivedAt: null }),
    };

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.search) {
      where.name = { contains: options.search, mode: 'insensitive' };
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        tasks: {
          select: { status: true },
        },
        _count: {
          select: { memberships: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return projects.map((p) => {
      const totalTasks = p.tasks.length;
      const completedTasks = p.tasks.filter((t) => t.status === TaskStatus.DONE).length;
      const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const { tasks, _count, ...rest } = p;
      return {
        ...rest,
        totalTasks,
        completedTasks,
        progressPercentage,
        membersCount: _count.memberships,
      };
    });
  }

  async update(
    id: string,
    data: Partial<Pick<Project, 'name' | 'description' | 'status' | 'startDate' | 'dueDate'>>
  ): Promise<Project> {
    return prisma.project.update({
      where: { id },
      data,
    });
  }

  async archive(id: string): Promise<Project> {
    return prisma.project.update({
      where: { id },
      data: {
        status: ProjectStatus.ARCHIVED,
        archivedAt: new Date(),
      },
    });
  }

  async listMembers(projectId: string) {
    return prisma.projectMembership.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findMember(projectId: string, userId: string) {
    return prisma.projectMembership.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
      include: { user: true },
    });
  }

  async addMember(projectId: string, userId: string, role: ProjectRole = ProjectRole.CONTRIBUTOR) {
    return prisma.projectMembership.create({
      data: {
        projectId,
        userId,
        role,
      },
    });
  }

  async removeMember(projectId: string, userId: string) {
    return prisma.projectMembership.delete({
      where: {
        projectId_userId: { projectId, userId },
      },
    });
  }
}

export const projectRepository = new ProjectRepository();
