import { workspaceRepository } from '../repositories/WorkspaceRepository.js';
import { projectRepository } from '../repositories/ProjectRepository.js';
import { taskRepository } from '../repositories/TaskRepository.js';
import { notificationRepository } from '../repositories/NotificationRepository.js';
import { activityLogRepository } from '../repositories/ActivityLogRepository.js';

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
    const assignedTasks = await taskRepository.findAssignedUncompleted(userId, workspaceId, 10);

    // 2. Tasks Due Soon (next 3 days, across workspace)
    const dueSoonTasks = await taskRepository.findDueSoonWorkspace(workspaceId, now, threeDaysFromNow, 5);

    // 3. Overdue Tasks (across workspace)
    const overdueTasks = await taskRepository.findOverdueWorkspace(workspaceId, now, 5);

    // 4. Counts
    const [assignedCount, dueSoonCount, overdueCount] = await Promise.all([
      taskRepository.countAssignedUncompleted(userId, workspaceId),
      taskRepository.countDueSoonWorkspace(workspaceId, now, threeDaysFromNow),
      taskRepository.countOverdueWorkspace(workspaceId, now),
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
      projectRepository.searchInWorkspace(workspaceId, trimmed, 10),
      taskRepository.searchInWorkspace(workspaceId, trimmed, 20),
    ]);

    return { projects, tasks };
  }
}

export const dashboardService = new DashboardService();
