import type { Request, Response, NextFunction } from "express";
import { verifyToken, type JwtPayload } from "../utils/jwt";
import { sendError } from "../errors";

//* Extend Express Request type

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // !1. Header missing
  if (!authHeader) {
    return sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Authorization header missing",
    });
  }

  //! 2. Wrong format
  if (!authHeader.startsWith("Bearer ")) {
    return sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Invalid authorization format",
    });
  }

  const token = authHeader.slice(7).trim();

  //! 3. Basic sanity check
  if (!token || token.length < 20) {
    return sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Invalid token",
    });
  }

  //! 4. Verify token
  const payload = verifyToken(token);

  if (!payload) {
    return sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Token expired or invalid",
    });
  }

  //! 5. Attach user
  req.user = payload;

  return next();
}
