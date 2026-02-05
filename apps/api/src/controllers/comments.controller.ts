import type { Request, Response } from "express";
import { sendError } from "../errors";
import { parseBody } from "../validation/parse";
import { createCommentBodySchema } from "../validation/comments";
import type { AuthLocals } from "../auth/middleware";
import * as commentService from "../services/comment.service";

function parseTaskId(req: Request): number | null {
  const id = Number(req.params.taskId);
  return Number.isInteger(id) && id >= 1 ? id : null;
}

function getUserId(res: Response): number {
  return (res as unknown as { locals: AuthLocals }).locals.userId;
}

export function getComments(req: Request, res: Response): void {
  const taskId = parseTaskId(req);
  if (taskId === null) {
    sendError(res, 400, { code: "BAD_REQUEST", message: "Invalid task id" });
    return;
  }
  try {
    const comments = commentService.getComments(taskId);
    res.json(comments);
  } catch (err) {
    if (err && typeof err === "object" && (err as { code: string }).code === "NOT_FOUND") {
      sendError(res, 404, { code: "NOT_FOUND", message: "Task not found" });
      return;
    }
    throw err;
  }
}

export function addComment(req: Request, res: Response): void {
  const taskId = parseTaskId(req);
  if (taskId === null) {
    sendError(res, 400, { code: "BAD_REQUEST", message: "Invalid task id" });
    return;
  }
  const body = parseBody(res, createCommentBodySchema, req.body);
  if (body === undefined) return;
  const userId = getUserId(res);
  try {
    const comment = commentService.addComment(taskId, userId, body);
    res.status(201).json(comment);
  } catch (err) {
    if (err && typeof err === "object" && (err as { code: string }).code === "NOT_FOUND") {
      sendError(res, 404, { code: "NOT_FOUND", message: "Task not found" });
      return;
    }
    throw err;
  }
}
