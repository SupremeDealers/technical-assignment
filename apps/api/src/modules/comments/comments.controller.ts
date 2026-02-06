import { Request, Response } from "express";
import { getComments, createComment } from "./comments.service";
import { createCommentSchema } from "./comments.schema";

export const getCommentsHandler = async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const userId = req.user!.id;

  const comments = await getComments(taskId, userId);
  res.json(comments);
};

export const postCommentHandler = async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const userId = req.user!.id;

  const { content } = createCommentSchema.parse(req.body);
  const comment = await createComment(taskId, userId, content);

  res.status(201).json(comment);
};
