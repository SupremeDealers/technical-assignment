import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "./jwt";
import { sendError } from "../errors";

export type AuthLocals = { userId: number; email: string };

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    sendError(res, 401, { code: "UNAUTHORIZED", message: "Missing or invalid token" });
    return;
  }
  const payload = verifyToken(token);
  if (!payload) {
    sendError(res, 401, { code: "UNAUTHORIZED", message: "Invalid or expired token" });
    return;
  }
  (res as unknown as { locals: AuthLocals }).locals = {
    userId: payload.userId,
    email: payload.email,
  };
  next();
}
