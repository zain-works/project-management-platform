import { WorkspaceRole } from '@pmp/shared';

export interface WorkspaceInvitationAttributes {
  id: string;
  workspaceId: string;
  invitedEmail: string;
  role: WorkspaceRole;
  tokenHash: string;
  invitedById: string;
  expiresAt: Date;
  acceptedAt?: Date | null;
  createdAt?: Date;
}

export class WorkspaceInvitationModel {
  readonly id: string;
  readonly workspaceId: string;
  readonly invitedEmail: string;
  readonly role: WorkspaceRole;
  readonly tokenHash: string;
  readonly invitedById: string;
  readonly expiresAt: Date;
  readonly acceptedAt?: Date | null;
  readonly createdAt: Date;

  constructor(attributes: WorkspaceInvitationAttributes) {
    this.id = attributes.id;
    this.workspaceId = attributes.workspaceId;
    this.invitedEmail = attributes.invitedEmail.toLowerCase().trim();
    this.role = attributes.role;
    this.tokenHash = attributes.tokenHash;
    this.invitedById = attributes.invitedById;
    this.expiresAt = attributes.expiresAt;
    this.acceptedAt = attributes.acceptedAt ?? null;
    this.createdAt = attributes.createdAt ?? new Date();
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isAccepted(): boolean {
    return this.acceptedAt !== null;
  }

  isValid(): boolean {
    return !this.isExpired() && !this.isAccepted();
  }
}
