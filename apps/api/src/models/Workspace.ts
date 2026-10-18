import { WorkspaceRole } from '@pmp/shared';

export interface WorkspaceAttributes {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class WorkspaceModel {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly ownerId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(attributes: WorkspaceAttributes) {
    this.id = attributes.id;
    this.name = attributes.name.trim();
    this.slug = attributes.slug.toLowerCase().trim();
    this.ownerId = attributes.ownerId;
    this.createdAt = attributes.createdAt ?? new Date();
    this.updatedAt = attributes.updatedAt ?? new Date();
  }

  isOwner(userId: string): boolean {
    return this.ownerId === userId;
  }

  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
