import { prisma } from '../config/database.js';
import { Comment, User } from '@prisma/client';

export interface CommentWithAuthor extends Comment {
  author: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
}

export class CommentRepository {
  async create(data: { taskId: string; authorId: string; content: string }): Promise<CommentWithAuthor> {
    return prisma.comment.create({
      data,
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  async findById(id: string): Promise<CommentWithAuthor | null> {
    return prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  async findByTaskId(taskId: string): Promise<CommentWithAuthor[]> {
    return prisma.comment.findMany({
      where: {
        taskId,
        deletedAt: null,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async update(id: string, content: string): Promise<CommentWithAuthor> {
    return prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  async softDelete(id: string): Promise<Comment> {
    return prisma.comment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export const commentRepository = new CommentRepository();
