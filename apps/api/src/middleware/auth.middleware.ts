import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { sendError } from "../utils/errors";

export interface AuthRequest extends Request {
  user?: { userId: number; email: string };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Invalid token",
    });
  }
};
