import { ActivityAction } from '@pmp/shared';

export interface ActivityLogAttributes {
  id: string;
  workspaceId: string;
  projectId?: string | null;
  actorId?: string | null;
  actionType: ActivityAction | string;
  resourceType: string;
  resourceId: string;
  metadata?: any;
  createdAt?: Date;
}

export class ActivityLogModel {
  readonly id: string;
  readonly workspaceId: string;
  readonly projectId?: string | null;
  readonly actorId?: string | null;
  readonly actionType: string;
  readonly resourceType: string;
  readonly resourceId: string;
  readonly metadata?: any;
  readonly createdAt: Date;

  constructor(attributes: ActivityLogAttributes) {
    this.id = attributes.id;
    this.workspaceId = attributes.workspaceId;
    this.projectId = attributes.projectId ?? null;
    this.actorId = attributes.actorId ?? null;
    this.actionType = attributes.actionType;
    this.resourceType = attributes.resourceType;
    this.resourceId = attributes.resourceId;
    this.metadata = attributes.metadata ?? null;
    this.createdAt = attributes.createdAt ?? new Date();
  }
}
