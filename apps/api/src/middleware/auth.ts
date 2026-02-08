import type { Request, Response, NextFunction } from "express";
import { verifyToken, type JwtPayload } from "../lib/jwt";
import { sendError } from "../errors";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
    return;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Invalid or expired token",
    });
    return;
  }

  req.user = payload;
  next();
}
