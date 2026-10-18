import { prisma } from '../config/database.js';
import { Task, TaskStatus, TaskPriority, User } from '@prisma/client';

export interface TaskWithDetails extends Task {
  assignee: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'> | null;
  createdBy: Pick<User, 'id' | 'name' | 'email'>;
  commentsCount: number;
}

export interface TaskFilterOptions {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  search?: string;
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'position';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export class TaskRepository {
  async create(data: {
    projectId: string;
    title: string;
    description?: string | null;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string | null;
    createdById: string;
    dueDate?: Date | null;
    position?: number;
  }): Promise<Task> {
    return prisma.task.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        status: data.status || TaskStatus.TODO,
        priority: data.priority || TaskPriority.MEDIUM,
        assigneeId: data.assigneeId,
        createdById: data.createdById,
        dueDate: data.dueDate,
        position: data.position ?? 0,
        completedAt: data.status === TaskStatus.DONE ? new Date() : null,
      },
    });
  }

  async findById(id: string): Promise<TaskWithDetails | null> {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    if (!task) return null;
    const { _count, ...rest } = task;
    return {
      ...rest,
      commentsCount: _count.comments,
    };
  }

  async findByProject(projectId: string, options?: TaskFilterOptions): Promise<{ tasks: TaskWithDetails[]; total: number }> {
    const where: any = { projectId };

    if (options?.status) {
      where.status = options.status;
    }
    if (options?.priority) {
      where.priority = options.priority;
    }
    if (options?.assigneeId !== undefined) {
      where.assigneeId = options.assigneeId;
    }
    if (options?.search) {
      where.OR = [
        { title: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.task.count({ where });

    const page = options?.page || 1;
    const limit = options?.limit || 100;
    const skip = (page - 1) * limit;

    const orderBy: any = {};
    const sortField = options?.sortBy || 'position';
    const sortDir = options?.sortOrder || 'asc';
    orderBy[sortField] = sortDir;

    const rawTasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    const tasks = rawTasks.map(({ _count, ...t }) => ({
      ...t,
      commentsCount: _count.comments,
    }));

    return { tasks, total };
  }

  async update(
    id: string,
    data: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'assigneeId' | 'dueDate' | 'position'>>
  ): Promise<Task> {
    const updateData: any = { ...data };
    if (data.status) {
      if (data.status === TaskStatus.DONE) {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }

    return prisma.task.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<Task> {
    return prisma.task.delete({
      where: { id },
    });
  }

  async findAssignedToUser(userId: string, workspaceId?: string): Promise<TaskWithDetails[]> {
    const where: any = { assigneeId: userId };
    if (workspaceId) {
      where.project = { workspaceId };
    }

    const rawTasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { dueDate: 'asc' },
      take: 50,
    });

    return rawTasks.map(({ _count, ...t }) => ({
      ...t,
      commentsCount: _count.comments,
    }));
  }

  async findDueSoon(windowHours = 24): Promise<Task[]> {
    const now = new Date();
    const threshold = new Date(now.getTime() + windowHours * 60 * 60 * 1000);

    return prisma.task.findMany({
      where: {
        dueDate: {
          gte: now,
          lte: threshold,
        },
        status: {
          not: TaskStatus.DONE,
        },
        assigneeId: {
          not: null,
        },
      },
    });
  }

  async findAssignedUncompleted(userId: string, workspaceId: string, limit = 10) {
    return prisma.task.findMany({
      where: {
        assigneeId: userId,
        project: { workspaceId },
        status: { not: TaskStatus.DONE },
      },
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: limit,
    });
  }

  async findDueSoonWorkspace(workspaceId: string, fromDate: Date, toDate: Date, limit = 5) {
    return prisma.task.findMany({
      where: {
        project: { workspaceId },
        status: { not: TaskStatus.DONE },
        dueDate: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: limit,
    });
  }

  async findOverdueWorkspace(workspaceId: string, beforeDate: Date, limit = 5) {
    return prisma.task.findMany({
      where: {
        project: { workspaceId },
        status: { not: TaskStatus.DONE },
        dueDate: {
          lt: beforeDate,
        },
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: limit,
    });
  }

  async countAssignedUncompleted(userId: string, workspaceId: string): Promise<number> {
    return prisma.task.count({
      where: {
        assigneeId: userId,
        project: { workspaceId },
        status: { not: TaskStatus.DONE },
      },
    });
  }

  async countDueSoonWorkspace(workspaceId: string, fromDate: Date, toDate: Date): Promise<number> {
    return prisma.task.count({
      where: {
        project: { workspaceId },
        status: { not: TaskStatus.DONE },
        dueDate: { gte: fromDate, lte: toDate },
      },
    });
  }

  async countOverdueWorkspace(workspaceId: string, beforeDate: Date): Promise<number> {
    return prisma.task.count({
      where: {
        project: { workspaceId },
        status: { not: TaskStatus.DONE },
        dueDate: { lt: beforeDate },
      },
    });
  }

  async searchInWorkspace(workspaceId: string, query: string, limit = 20) {
    return prisma.task.findMany({
      where: {
        project: { workspaceId },
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true } },
      },
      take: limit,
    });
  }
}

export const taskRepository = new TaskRepository();
