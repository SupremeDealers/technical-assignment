import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { prisma } from "../db/prisma";
import { sendError } from "../errors";

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const { authorization } = req.headers;
  if (!authorization) {
    return sendError(res, 401, {
      code: "NOT_FOUND",
      message: `Authorization token required: ${req.method} ${req.path}`,
    });
  }

  const token = authorization.split(" ")[1];

  try {
    const { id } = verifyToken(token) as any;
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: { id: true, email: true },
    });
    if (user) {
      req.user = user;
    }
    next();
  } catch {
    sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: `Request is not authorized: ${req.method} ${req.path}`,
    });
  }
}
