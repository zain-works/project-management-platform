import { prisma } from '../config/database.js';
import { ActivityLog, Prisma, User } from '@prisma/client';

export interface ActivityLogWithActor extends ActivityLog {
  actor: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'> | null;
}

export class ActivityLogRepository {
  async create(data: {
    workspaceId: string;
    projectId?: string | null;
    actorId?: string | null;
    actionType: string;
    resourceType: string;
    resourceId: string;
    metadata?: Prisma.InputJsonValue;
  }): Promise<ActivityLog> {
    return prisma.activityLog.create({
      data: {
        workspaceId: data.workspaceId,
        projectId: data.projectId,
        actorId: data.actorId,
        actionType: data.actionType,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        metadata: data.metadata,
      },
    });
  }

  async listByWorkspace(
    workspaceId: string,
    options?: { page?: number; limit?: number }
  ): Promise<{ logs: ActivityLogWithActor[]; total: number }> {
    const where = { workspaceId };
    const total = await prisma.activityLog.count({ where });

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        actor: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return { logs, total };
  }

  async listByProject(
    projectId: string,
    options?: { page?: number; limit?: number }
  ): Promise<{ logs: ActivityLogWithActor[]; total: number }> {
    const where = { projectId };
    const total = await prisma.activityLog.count({ where });

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        actor: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return { logs, total };
  }
}

export const activityLogRepository = new ActivityLogRepository();
