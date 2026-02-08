import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "../errors";

const SECRET = process.env.JWT_SECRET || "dev-secret";

export interface AuthRequest extends Request {
  user?: { userId: number };
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const auth = req.headers.authorization;
  if (!auth)
    return sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "No token found",
    });

  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, SECRET) as any;
    req.user = { userId: payload.userId };
    next();
  } catch {
    return sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Invalid token",
    });
  }
}
