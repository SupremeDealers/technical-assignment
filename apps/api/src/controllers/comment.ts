import type { Request, Response } from "express";
import { sendError } from "../errors";
import { createCommentSchema } from "../validators/comment";
import { formatZodError } from "../lib/validation";
import { isError } from "../lib/result";
import * as commentService from "../services/comment";

export async function createComment(req: Request, res: Response) {
  const result = createCommentSchema.safeParse(req.body);

  if (!result.success) {
    sendError(res, 400, {
      code: "BAD_REQUEST",
      message: "Invalid payload",
      details: formatZodError(result.error),
    });
    return;
  }

  const data = await commentService.createComment(
    req.params.taskId,
    result.data,
    req.user!.userId
  );

  if (isError(data)) {
    sendError(res, 404, {
      code: "NOT_FOUND",
      message: data.error,
    });
    return;
  }

  res.status(201).json(data);
}

export async function getComments(req: Request, res: Response) {
  const data = await commentService.getCommentsByTask(
    req.params.taskId,
    req.user!.userId
  );

  if (isError(data)) {
    sendError(res, 404, {
      code: "NOT_FOUND",
      message: data.error,
    });
    return;
  }

  res.json(data);
}

export async function deleteComment(req: Request, res: Response) {
  const data = await commentService.deleteComment(
    req.params.commentId,
    req.user!.userId
  );

  if (isError(data)) {
    sendError(res, 404, {
      code: "NOT_FOUND",
      message: data.error,
    });
    return;
  }

  res.status(204).send();
}
