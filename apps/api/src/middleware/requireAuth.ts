import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { prisma } from "../db/prisma";

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
    return res.status(401).json({
      code: "MISSING TOKEN",
      message: `Authorization token required: ${req.method} ${req.path}`,
    });
  }

  const token = authorization.split(" ")[1];

  try {
    const { id } = verifyToken(token) as any;
    req.user = await prisma.user.findUnique({ id }).select({ id: true });
    next();
  } catch {
    res.status(401).json({
      code: "UNAUTHORIZED",
      message: `Request is not authorized: ${req.method} ${req.path}`,
    });
  }
}
