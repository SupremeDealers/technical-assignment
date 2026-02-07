import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "./errors";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";

export interface AuthRequest extends Request {
  userId?: number;
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return decoded;
  } catch {
    return null;
  }
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Invalid or expired token",
    });
  }

  req.userId = decoded.userId;
  next();
}
