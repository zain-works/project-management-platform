import { Request, Response, NextFunction } from 'express';
import { commentService } from '../services/CommentService.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { getParam } from '../utils/params.js';

export class CommentController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const taskId = getParam(req, 'taskId');
      const comment = await commentService.createComment(
        taskId,
        authReq.user.id,
        req.body.content
      );
      res.status(201).json({ comment });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const taskId = getParam(req, 'taskId');
      const comments = await commentService.listComments(taskId, authReq.user.id);
      res.status(200).json({ comments });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const commentId = getParam(req, 'commentId');
      const comment = await commentService.updateComment(
        commentId,
        authReq.user.id,
        req.body.content
      );
      res.status(200).json({ comment });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const commentId = getParam(req, 'commentId');
      await commentService.deleteComment(commentId, authReq.user.id);
      res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const commentController = new CommentController();
