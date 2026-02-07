import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { sendError } from "../errors";
import db from "../db";
import type { UserPublic } from "../types";

export interface AuthRequest extends Request {
  user?: UserPublic;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Missing or invalid authorization header",
    });
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, config.jwtSecret) as { userId: string };

    const user = db
      .prepare("SELECT id, email, name, created_at FROM users WHERE id = ?")
      .get(payload.userId) as UserPublic | undefined;

    if (!user) {
      return sendError(res, 401, {
        code: "UNAUTHORIZED",
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch {
    return sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Invalid or expired token",
    });
  }
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: "7d",
  } as jwt.SignOptions);
}

export function checkBoardAccess(userId: string, boardId: string): boolean {
  const result = db
    .prepare(
      `
      SELECT 1 FROM boards WHERE id = ? AND owner_id = ?
      UNION
      SELECT 1 FROM board_members WHERE board_id = ? AND user_id = ?
    `
    )
    .get(boardId, userId, boardId, userId);

  return !!result;
}

export function checkColumnAccess(userId: string, columnId: string): boolean {
  const column = db
    .prepare("SELECT board_id FROM columns WHERE id = ?")
    .get(columnId) as { board_id: string } | undefined;

  if (!column) return false;

  return checkBoardAccess(userId, column.board_id);
}

export function checkTaskAccess(userId: string, taskId: string): boolean {
  const task = db
    .prepare("SELECT column_id FROM tasks WHERE id = ?")
    .get(taskId) as { column_id: string } | undefined;

  if (!task) return false;

  return checkColumnAccess(userId, task.column_id);
}
