import { Response } from "express";
import { AuthRequest } from "../types";
import { CommentService } from "../services/comment.service";
import { sendError, zodError } from "../errors";
import { createCommentSchema } from "../validators";
import { z } from "zod";

type CreateCommentInput = z.infer<typeof createCommentSchema>;

export class CommentController {
  private commentService: CommentService;

  constructor() {
    this.commentService = new CommentService();
  }

  getComments = async (req: AuthRequest, res: Response) => {
    try {
      const { taskId } = req.params;
      const comments = await this.commentService.getTaskComments({
        task_id: taskId,
        user_id: req.user_id!,
      });
      res.json(comments);
    } catch (error) {
      return zodError(res, error as z.ZodError);
    }
  };

  createComment = async (req: AuthRequest, res: Response) => {
    try {
      const { taskId } = req.params;
      const body: CreateCommentInput = createCommentSchema.parse(req.body);
      const comment = await this.commentService.createComment({
        task_id: taskId,
        author_id: req.user_id!,
        user_id: req.user_id!,
        ...body,
      });
      res.status(201).json(comment);
    } catch (error) {
      return zodError(res, error as z.ZodError);
    }
  };

  deleteComment = async (req: AuthRequest, res: Response) => {
    try {
      const { commentId } = req.params;
      await this.commentService.deleteComment({
        comment_id: commentId,
        user_id: req.user_id!,
      });
      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
      return zodError(res, error as z.ZodError);
    }
  };
}
