import { Request, Response, NextFunction } from "express";
import commentService from "../services/comment.service";
import { sendSuccess } from "../utils/response";
import { CreateCommentInput } from "../validators/comment.schema";
import {
  PaginationQuery,
  paginationSchema,
} from "../validators/pagination.schema";

export const commentController = {
  createComment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { taskId } = req.params;
      const data: CreateCommentInput = req.body;

      const comment = await commentService.createComment(userId, taskId, data);

      sendSuccess(res, comment, "Comment created successfully", 201);
    } catch (error) {
      next(error);
    }
  },

  getComments: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { taskId } = req.params;

      // const query: PaginationQuery = req.query;
      const query = paginationSchema.parse(req.query);

      const result = await commentService.getComments(userId, taskId, query);

      sendSuccess(res, result, "Comments retrieved successfully");
    } catch (error) {
      next(error);
    }
  },
};
