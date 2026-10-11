import { prisma } from '../config/database.js';
import { Workspace, WorkspaceMembership, WorkspaceInvitation, WorkspaceRole, User } from '@prisma/client';

export interface WorkspaceWithRole extends Workspace {
  membershipRole: WorkspaceRole;
  memberCount: number;
  projectCount: number;
}

export class WorkspaceRepository {
  async create(data: { name: string; slug: string; ownerId: string }): Promise<Workspace> {
    return prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: data.name,
          slug: data.slug,
          ownerId: data.ownerId,
        },
      });

      // Automatically add owner membership
      await tx.workspaceMembership.create({
        data: {
          workspaceId: workspace.id,
          userId: data.ownerId,
          role: WorkspaceRole.OWNER,
        },
      });

      return workspace;
    });
  }

  async findById(id: string): Promise<Workspace | null> {
    return prisma.workspace.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string): Promise<Workspace | null> {
    return prisma.workspace.findUnique({
      where: { slug },
    });
  }

  async findUserWorkspaces(userId: string): Promise<WorkspaceWithRole[]> {
    const memberships = await prisma.workspaceMembership.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            _count: {
              select: {
                memberships: true,
                projects: true,
              },
            },
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    return memberships.map((m) => ({
      ...m.workspace,
      membershipRole: m.role,
      memberCount: m.workspace._count.memberships,
      projectCount: m.workspace._count.projects,
    }));
  }

  async update(id: string, data: { name?: string; slug?: string }): Promise<Workspace> {
    return prisma.workspace.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Workspace> {
    return prisma.workspace.delete({
      where: { id },
    });
  }

  async findMember(workspaceId: string, userId: string): Promise<(WorkspaceMembership & { user: User }) | null> {
    return prisma.workspaceMembership.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId },
      },
      include: { user: true },
    });
  }

  async listMembers(workspaceId: string): Promise<(WorkspaceMembership & { user: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'> })[]> {
    return prisma.workspaceMembership.findMany({
      where: { workspaceId },
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
      orderBy: { joinedAt: 'asc' },
    });
  }

  async addMember(workspaceId: string, userId: string, role: WorkspaceRole): Promise<WorkspaceMembership> {
    return prisma.workspaceMembership.create({
      data: {
        workspaceId,
        userId,
        role,
      },
    });
  }

  async updateMemberRole(workspaceId: string, userId: string, role: WorkspaceRole): Promise<WorkspaceMembership> {
    return prisma.workspaceMembership.update({
      where: {
        workspaceId_userId: { workspaceId, userId },
      },
      data: { role },
    });
  }

  async removeMember(workspaceId: string, userId: string): Promise<WorkspaceMembership> {
    return prisma.workspaceMembership.delete({
      where: {
        workspaceId_userId: { workspaceId, userId },
      },
    });
  }

  async createInvitation(data: {
    workspaceId: string;
    invitedEmail: string;
    role: WorkspaceRole;
    tokenHash: string;
    invitedById: string;
    expiresAt: Date;
  }): Promise<WorkspaceInvitation> {
    return prisma.workspaceInvitation.create({
      data: {
        ...data,
        invitedEmail: data.invitedEmail.toLowerCase().trim(),
      },
    });
  }

  async findInvitationByTokenHash(tokenHash: string): Promise<(WorkspaceInvitation & { workspace: Workspace }) | null> {
    return prisma.workspaceInvitation.findUnique({
      where: { tokenHash },
      include: { workspace: true },
    });
  }

  async listPendingInvitations(workspaceId: string): Promise<WorkspaceInvitation[]> {
    return prisma.workspaceInvitation.findMany({
      where: {
        workspaceId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markInvitationAccepted(id: string): Promise<WorkspaceInvitation> {
    return prisma.workspaceInvitation.update({
      where: { id },
      data: { acceptedAt: new Date() },
    });
  }
}

export const workspaceRepository = new WorkspaceRepository();
