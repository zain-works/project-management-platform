import { TaskStatus, TaskPriority } from '@pmp/shared';

export interface TaskAttributes {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  createdById: string;
  dueDate?: Date | null;
  completedAt?: Date | null;
  position?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class TaskModel {
  readonly id: string;
  readonly projectId: string;
  readonly title: string;
  readonly description?: string | null;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly assigneeId?: string | null;
  readonly createdById: string;
  readonly dueDate?: Date | null;
  readonly completedAt?: Date | null;
  readonly position: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(attributes: TaskAttributes) {
    this.id = attributes.id;
    this.projectId = attributes.projectId;
    this.title = attributes.title.trim();
    this.description = attributes.description ?? null;
    this.status = attributes.status ?? TaskStatus.TODO;
    this.priority = attributes.priority ?? TaskPriority.MEDIUM;
    this.assigneeId = attributes.assigneeId ?? null;
    this.createdById = attributes.createdById;
    this.dueDate = attributes.dueDate ?? null;
    this.completedAt = attributes.completedAt ?? null;
    this.position = attributes.position ?? 0;
    this.createdAt = attributes.createdAt ?? new Date();
    this.updatedAt = attributes.updatedAt ?? new Date();
  }

  isCompleted(): boolean {
    return this.status === TaskStatus.DONE;
  }

  isAssigned(): boolean {
    return this.assigneeId !== null;
  }

  isAssignedTo(userId: string): boolean {
    return this.assigneeId === userId;
  }

  isDueSoon(hoursThreshold = 24, fromDate = new Date()): boolean {
    if (!this.dueDate || this.isCompleted()) return false;
    const threshold = new Date(fromDate.getTime() + hoursThreshold * 60 * 60 * 1000);
    return this.dueDate >= fromDate && this.dueDate <= threshold;
  }

  isOverdue(fromDate = new Date()): boolean {
    if (!this.dueDate || this.isCompleted()) return false;
    return this.dueDate < fromDate;
  }
}
