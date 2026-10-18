import { WorkspaceRole, hasMinimumRole } from '@pmp/shared';

export interface WorkspaceMemberAttributes {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt?: Date;
}

export class WorkspaceMemberModel {
  readonly id: string;
  readonly workspaceId: string;
  readonly userId: string;
  readonly role: WorkspaceRole;
  readonly joinedAt: Date;

  constructor(attributes: WorkspaceMemberAttributes) {
    this.id = attributes.id;
    this.workspaceId = attributes.workspaceId;
    this.userId = attributes.userId;
    this.role = attributes.role;
    this.joinedAt = attributes.joinedAt ?? new Date();
  }

  hasRole(requiredRole: WorkspaceRole): boolean {
    return hasMinimumRole(this.role, requiredRole);
  }

  isOwner(): boolean {
    return this.role === WorkspaceRole.OWNER;
  }

  isAdminOrOwner(): boolean {
    return this.hasRole(WorkspaceRole.ADMIN);
  }
}
