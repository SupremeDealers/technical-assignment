import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import type { Request, Response, NextFunction } from "express";
import { sendError } from "./errors";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export interface AuthRequest extends Request {
  userId?: string;
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 10);
}

export async function comparePasswords(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Missing or invalid authorization token",
    });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Invalid or expired token",
    });
    return;
  }

  req.userId = payload.userId;
  next();
}
