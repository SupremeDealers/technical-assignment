import type { Request, Response, NextFunction } from "express";
import { sendError } from "../errors";
import { AUTH_COOKIE } from "../auth/cookies";
import { verifyToken } from "../auth/jwt";

export type AuthedRequest = Request & { userId: string };

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE];
  if (!token) {
    return sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  try {
    const payload = verifyToken(token);
    (req as AuthedRequest).userId = payload.userId;
    return next();
  } catch {
    return sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Invalid or expired token",
    });
  }
}
