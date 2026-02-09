import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { User } from "../models";
import { createError } from "../utils/createError";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createError(401, "No token provided");
    }

    const token = authHeader.substring(7);

    // verifyToken already throws createError on failure
    const decoded = verifyToken(token);

    // Verify user still exists
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      throw createError(401, "User not found");
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};
