import { prisma } from '../config/database.js';
import { workspaceRepository } from '../repositories/WorkspaceRepository.js';
import { projectRepository } from '../repositories/ProjectRepository.js';
import { notificationRepository } from '../repositories/NotificationRepository.js';
import { activityLogRepository } from '../repositories/ActivityLogRepository.js';
import { TaskStatus } from '@pmp/shared';

export class DashboardService {
  async getDashboardData(workspaceId: string, userId: string) {
    const membership = await workspaceRepository.findMember(workspaceId, userId);
    if (!membership) {
      const error: any = new Error('Access denied to workspace dashboard');
      error.statusCode = 403;
      throw error;
    }

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // 1. User Assigned Tasks in this Workspace
    const assignedTasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        project: { workspaceId },
        status: { not: TaskStatus.DONE },
      },
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    });

    // 2. Tasks Due Soon (next 3 days, across workspace)
    const dueSoonTasks = await prisma.task.findMany({
      where: {
        project: { workspaceId },
        status: { not: TaskStatus.DONE },
        dueDate: {
          gte: now,
          lte: threeDaysFromNow,
        },
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    });

    // 3. Overdue Tasks (across workspace)
    const overdueTasks = await prisma.task.findMany({
      where: {
        project: { workspaceId },
        status: { not: TaskStatus.DONE },
        dueDate: {
          lt: now,
        },
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    });

    // 4. Overdue count & Assigned count
    const [assignedCount, dueSoonCount, overdueCount] = await Promise.all([
      prisma.task.count({
        where: {
          assigneeId: userId,
          project: { workspaceId },
          status: { not: TaskStatus.DONE },
        },
      }),
      prisma.task.count({
        where: {
          project: { workspaceId },
          status: { not: TaskStatus.DONE },
          dueDate: { gte: now, lte: threeDaysFromNow },
        },
      }),
      prisma.task.count({
        where: {
          project: { workspaceId },
          status: { not: TaskStatus.DONE },
          dueDate: { lt: now },
        },
      }),
    ]);

    // 5. Recent Projects with Progress %
    const projects = await projectRepository.listByWorkspace(workspaceId);

    // 6. Recent Activity
    const { logs: recentActivity } = await activityLogRepository.listByWorkspace(workspaceId, { limit: 10 });

    // 7. Unread notification count for user
    const unreadNotificationCount = await notificationRepository.countUnread(userId);

    return {
      metrics: {
        assignedTasksCount: assignedCount,
        dueSoonTasksCount: dueSoonCount,
        overdueTasksCount: overdueCount,
        totalProjectsCount: projects.length,
        unreadNotificationCount,
      },
      assignedTasks,
      dueSoonTasks,
      overdueTasks,
      recentProjects: projects.slice(0, 5),
      recentActivity,
    };
  }

  async search(workspaceId: string, userId: string, query: string) {
    const membership = await workspaceRepository.findMember(workspaceId, userId);
    if (!membership) {
      const error: any = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }

    if (!query || query.trim().length === 0) {
      return { projects: [], tasks: [] };
    }

    const trimmed = query.trim();

    const [projects, tasks] = await Promise.all([
      prisma.project.findMany({
        where: {
          workspaceId,
          archivedAt: null,
          OR: [
            { name: { contains: trimmed, mode: 'insensitive' } },
            { description: { contains: trimmed, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      prisma.task.findMany({
        where: {
          project: { workspaceId },
          OR: [
            { title: { contains: trimmed, mode: 'insensitive' } },
            { description: { contains: trimmed, mode: 'insensitive' } },
          ],
        },
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true, avatarUrl: true } },
        },
        take: 20,
      }),
    ]);

    return { projects, tasks };
  }
}

export const dashboardService = new DashboardService();
