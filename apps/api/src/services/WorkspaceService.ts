import { workspaceRepository, WorkspaceWithRole } from '../repositories/WorkspaceRepository.js';
import { userRepository } from '../repositories/UserRepository.js';
import { eventDispatcher } from '../events/dispatcher/DomainEventDispatcher.js';
import { createDomainEvent } from '../events/definitions/events.js';
import { generateRandomToken, hashToken } from '../utils/tokens.js';
import { WorkspaceRole, hasMinimumRole } from '@pmp/shared';

export class WorkspaceService {
  async createWorkspace(userId: string, data: { name: string; slug?: string }): Promise<WorkspaceWithRole> {
    const rawSlug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = rawSlug;
    let counter = 1;

    // Check slug uniqueness
    while (await workspaceRepository.findBySlug(slug)) {
      slug = `${rawSlug}-${counter++}`;
    }

    const workspace = await workspaceRepository.create({
      name: data.name,
      slug,
      ownerId: userId,
    });

    const event = createDomainEvent('WorkspaceCreated', {
      workspaceId: workspace.id,
      ownerId: userId,
      name: workspace.name,
      slug: workspace.slug,
    }, { actorId: userId, workspaceId: workspace.id });
    await eventDispatcher.dispatch(event);

    return {
      ...workspace,
      membershipRole: WorkspaceRole.OWNER,
      memberCount: 1,
      projectCount: 0,
    };
  }

  async getWorkspacesForUser(userId: string): Promise<WorkspaceWithRole[]> {
    return workspaceRepository.findUserWorkspaces(userId);
  }

  async getWorkspaceById(workspaceId: string, userId: string) {
    const membership = await workspaceRepository.findMember(workspaceId, userId);
    if (!membership) {
      const error: any = new Error('Workspace not found or access denied');
      error.statusCode = 404;
      throw error;
    }

    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      const error: any = new Error('Workspace not found');
      error.statusCode = 404;
      throw error;
    }

    return {
      ...workspace,
      currentUserRole: membership.role,
    };
  }

  async updateWorkspace(workspaceId: string, userId: string, data: { name?: string; slug?: string }) {
    const membership = await workspaceRepository.findMember(workspaceId, userId);
    if (!membership || !hasMinimumRole(membership.role as WorkspaceRole, WorkspaceRole.ADMIN)) {
      const error: any = new Error('Insufficient permissions to modify workspace settings');
      error.statusCode = 403;
      throw error;
    }

    if (data.slug) {
      const existing = await workspaceRepository.findBySlug(data.slug);
      if (existing && existing.id !== workspaceId) {
        const error: any = new Error('Workspace slug is already taken');
        error.statusCode = 409;
        throw error;
      }
    }

    return workspaceRepository.update(workspaceId, data);
  }

  async listMembers(workspaceId: string, userId: string) {
    const membership = await workspaceRepository.findMember(workspaceId, userId);
    if (!membership) {
      const error: any = new Error('Access denied to workspace members');
      error.statusCode = 403;
      throw error;
    }

    return workspaceRepository.listMembers(workspaceId);
  }

  async inviteMember(workspaceId: string, inviterId: string, data: { email: string; role: WorkspaceRole }) {
    const inviterMembership = await workspaceRepository.findMember(workspaceId, inviterId);
    if (!inviterMembership || !hasMinimumRole(inviterMembership.role as WorkspaceRole, WorkspaceRole.ADMIN)) {
      const error: any = new Error('Only Workspace Admins and Owners can invite members');
      error.statusCode = 403;
      throw error;
    }

    // Check if target user is already a member
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      const alreadyMember = await workspaceRepository.findMember(workspaceId, existingUser.id);
      if (alreadyMember) {
        const error: any = new Error('User is already a member of this workspace');
        error.statusCode = 409;
        throw error;
      }
    }

    const rawToken = generateRandomToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await workspaceRepository.createInvitation({
      workspaceId,
      invitedEmail: data.email,
      role: data.role,
      tokenHash,
      invitedById: inviterId,
      expiresAt,
    });

    const event = createDomainEvent('WorkspaceMemberInvited', {
      workspaceId,
      invitationId: invitation.id,
      invitedEmail: data.email,
      role: data.role,
      invitedById: inviterId,
      token: rawToken,
    }, { actorId: inviterId, workspaceId });
    await eventDispatcher.dispatch(event);

    return {
      invitation,
      inviteUrl: `/signup?invitationToken=${rawToken}`,
    };
  }

  async acceptInvitation(rawToken: string, userId: string) {
    const tokenHash = hashToken(rawToken);
    const invitation = await workspaceRepository.findInvitationByTokenHash(tokenHash);

    if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) {
      const error: any = new Error('Invitation is invalid or has expired');
      error.statusCode = 400;
      throw error;
    }

    // Add user as member if not already a member
    const existingMember = await workspaceRepository.findMember(invitation.workspaceId, userId);
    if (!existingMember) {
      await workspaceRepository.addMember(invitation.workspaceId, userId, invitation.role);
    }

    // Mark invitation as accepted
    await workspaceRepository.markInvitationAccepted(invitation.id);

    // Dispatch event for notifications/activity logging
    const event = createDomainEvent('WorkspaceMemberJoined', {
      workspaceId: invitation.workspaceId,
      userId,
      role: invitation.role,
    }, { actorId: userId, workspaceId: invitation.workspaceId });
    await eventDispatcher.dispatch(event);

    return invitation.workspace;
  }

  async updateMemberRole(workspaceId: string, actorId: string, targetUserId: string, newRole: WorkspaceRole) {
    const actorMembership = await workspaceRepository.findMember(workspaceId, actorId);
    if (!actorMembership || !hasMinimumRole(actorMembership.role as WorkspaceRole, WorkspaceRole.ADMIN)) {
      const error: any = new Error('Only workspace admins or owners can change member roles');
      error.statusCode = 403;
      throw error;
    }

    const targetMembership = await workspaceRepository.findMember(workspaceId, targetUserId);
    if (!targetMembership) {
      const error: any = new Error('Member not found in workspace');
      error.statusCode = 404;
      throw error;
    }

    // Cannot demote or change the owner
    const workspace = await workspaceRepository.findById(workspaceId);
    if (workspace?.ownerId === targetUserId) {
      const error: any = new Error('Cannot change the role of the workspace owner');
      error.statusCode = 400;
      throw error;
    }

    return workspaceRepository.updateMemberRole(workspaceId, targetUserId, newRole);
  }

  async removeMember(workspaceId: string, actorId: string, targetUserId: string) {
    const actorMembership = await workspaceRepository.findMember(workspaceId, actorId);
    if (!actorMembership || !hasMinimumRole(actorMembership.role as WorkspaceRole, WorkspaceRole.ADMIN)) {
      const error: any = new Error('Only workspace admins or owners can remove members');
      error.statusCode = 403;
      throw error;
    }

    const workspace = await workspaceRepository.findById(workspaceId);
    if (workspace?.ownerId === targetUserId) {
      const error: any = new Error('Cannot remove the workspace owner');
      error.statusCode = 400;
      throw error;
    }

    return workspaceRepository.removeMember(workspaceId, targetUserId);
  }

  async deleteWorkspace(workspaceId: string, userId: string) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      const error: any = new Error('Workspace not found');
      error.statusCode = 404;
      throw error;
    }

    if (workspace.ownerId !== userId) {
      const error: any = new Error('Only the workspace owner can delete the workspace');
      error.statusCode = 403;
      throw error;
    }

    return workspaceRepository.delete(workspaceId);
  }
}

export const workspaceService = new WorkspaceService();
