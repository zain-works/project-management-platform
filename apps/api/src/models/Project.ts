import { ProjectStatus } from '@pmp/shared';

export interface ProjectAttributes {
  id: string;
  workspaceId: string;
  name: string;
  description?: string | null;
  status?: ProjectStatus;
  createdById: string;
  startDate?: Date | null;
  dueDate?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  archivedAt?: Date | null;
}

export class ProjectModel {
  readonly id: string;
  readonly workspaceId: string;
  readonly name: string;
  readonly description?: string | null;
  readonly status: ProjectStatus;
  readonly createdById: string;
  readonly startDate?: Date | null;
  readonly dueDate?: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly archivedAt?: Date | null;

  constructor(attributes: ProjectAttributes) {
    this.id = attributes.id;
    this.workspaceId = attributes.workspaceId;
    this.name = attributes.name.trim();
    this.description = attributes.description ?? null;
    this.status = attributes.status ?? ProjectStatus.ACTIVE;
    this.createdById = attributes.createdById;
    this.startDate = attributes.startDate ?? null;
    this.dueDate = attributes.dueDate ?? null;
    this.createdAt = attributes.createdAt ?? new Date();
    this.updatedAt = attributes.updatedAt ?? new Date();
    this.archivedAt = attributes.archivedAt ?? null;
  }

  isArchived(): boolean {
    return this.archivedAt !== null || this.status === ProjectStatus.ARCHIVED;
  }

  isActive(): boolean {
    return this.status === ProjectStatus.ACTIVE && !this.isArchived();
  }
}
