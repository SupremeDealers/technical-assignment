import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { sendError } from "../errors";
import db from "../db";
import type { UserPublic, BoardMember } from "../types";

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

    const userRow = db
      .prepare("SELECT id, email, name, is_admin, created_at FROM users WHERE id = ?")
      .get(payload.userId) as { id: string; email: string; name: string; is_admin: number; created_at: string } | undefined;

    if (!userRow) {
      return sendError(res, 401, {
        code: "UNAUTHORIZED",
        message: "User not found",
      });
    }

    req.user = {
      id: userRow.id,
      email: userRow.email,
      name: userRow.name,
      is_admin: Boolean(userRow.is_admin),
      created_at: userRow.created_at,
    };
    next();
  } catch {
    return sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Invalid or expired token",
    });
  }
}

// Middleware to check if user is a system admin
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user?.is_admin) {
    return sendError(res, 403, {
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  next();
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

// Get user's role in a board (owner, admin, member, or null if no access)
export function getBoardRole(userId: string, boardId: string): "owner" | "admin" | "member" | null {
  // Check if user is owner
  const board = db
    .prepare("SELECT owner_id FROM boards WHERE id = ?")
    .get(boardId) as { owner_id: string } | undefined;

  if (!board) return null;
  if (board.owner_id === userId) return "owner";

  // Check board membership
  const member = db
    .prepare("SELECT role FROM board_members WHERE board_id = ? AND user_id = ?")
    .get(boardId, userId) as { role: string } | undefined;

  if (!member) return null;
  return member.role as "admin" | "member";
}

// Check if user can manage board (owner or admin)
export function canManageBoard(userId: string, boardId: string): boolean {
  const role = getBoardRole(userId, boardId);
  return role === "owner" || role === "admin";
}

// Check if user can manage members (only owner)
export function canManageMembers(userId: string, boardId: string): boolean {
  const role = getBoardRole(userId, boardId);
  return role === "owner";
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

// Check if user can modify a task (creator, assignee, or board admin/owner)
export function canModifyTask(userId: string, taskId: string): boolean {
  const task = db
    .prepare(`
      SELECT t.created_by, t.assignee_id, c.board_id 
      FROM tasks t 
      JOIN columns c ON t.column_id = c.id 
      WHERE t.id = ?
    `)
    .get(taskId) as { created_by: string; assignee_id: string | null; board_id: string } | undefined;

  if (!task) return false;

  // Creator or assignee can modify
  if (task.created_by === userId || task.assignee_id === userId) return true;

  // Board owner or admin can modify
  return canManageBoard(userId, task.board_id);
}

// Get board members
export function getBoardMembers(boardId: string): BoardMember[] {
  return db
    .prepare("SELECT * FROM board_members WHERE board_id = ?")
    .all(boardId) as BoardMember[];
}
