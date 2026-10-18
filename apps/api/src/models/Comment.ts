export interface CommentAttributes {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class CommentModel {
  readonly id: string;
  readonly taskId: string;
  readonly authorId: string;
  readonly content: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt?: Date | null;

  constructor(attributes: CommentAttributes) {
    this.id = attributes.id;
    this.taskId = attributes.taskId;
    this.authorId = attributes.authorId;
    this.content = attributes.content.trim();
    this.createdAt = attributes.createdAt ?? new Date();
    this.updatedAt = attributes.updatedAt ?? new Date();
    this.deletedAt = attributes.deletedAt ?? null;
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  isAuthoredBy(userId: string): boolean {
    return this.authorId === userId;
  }
}
