import { Response, NextFunction } from 'express';
import * as commentService from '../services/comment.service';
import { createCommentSchema } from '../validation/comment.schema';
import { AuthRequest } from '../middleware/auth.middleware';

export const getComments = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;
    const comments = commentService.getComments(Number(taskId), req.user!.userId);
    res.json(comments);
  } catch (error) {
    next(error);
  }
};

export const createComment = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;
    const data = createCommentSchema.parse(req.body);
    const comment = commentService.createComment(Number(taskId), req.user!.userId, data);
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};