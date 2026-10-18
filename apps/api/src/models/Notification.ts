import { NotificationType } from '@pmp/shared';

export interface NotificationAttributes {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  resourceType?: string | null;
  resourceId?: string | null;
  readAt?: Date | null;
  createdAt?: Date;
}

export class NotificationModel {
  readonly id: string;
  readonly recipientId: string;
  readonly type: NotificationType;
  readonly title: string;
  readonly body: string;
  readonly resourceType?: string | null;
  readonly resourceId?: string | null;
  readonly readAt?: Date | null;
  readonly createdAt: Date;

  constructor(attributes: NotificationAttributes) {
    this.id = attributes.id;
    this.recipientId = attributes.recipientId;
    this.type = attributes.type;
    this.title = attributes.title;
    this.body = attributes.body;
    this.resourceType = attributes.resourceType ?? null;
    this.resourceId = attributes.resourceId ?? null;
    this.readAt = attributes.readAt ?? null;
    this.createdAt = attributes.createdAt ?? new Date();
  }

  isRead(): boolean {
    return this.readAt !== null;
  }
}
