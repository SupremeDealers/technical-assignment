import { Response } from "express";
import { AuthRequest } from "../types";
import { CommentService } from "../services/comment.service";
import { sendError } from "../errors";
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
      return sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to fetch comments",
      });
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
      if (error instanceof z.ZodError) {
        return sendError(res, 400, {
          code: "BAD_REQUEST",
          message: "Validation error",
          details: error.issues.map((e) => ({
            path: e.path.join("."),
            issue: e.message,
          })),
        });
      }
      return sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to create comment",
      });
    }
  };

  deleteComment = async (req: AuthRequest, res: Response) => {
    try {
      const { commentId } = req.params;
      await this.commentService.deleteComment({
        comment_id: commentId,
        user_id: req.user_id!,
      });
      res.status(204).send();
    } catch (error) {
      return sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to delete comment",
      });
    }
  };
}
