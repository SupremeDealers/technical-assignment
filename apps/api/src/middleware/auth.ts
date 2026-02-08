import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { sendError } from "../errors";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { Env } from "../config/configuration";

export class AuthMiddleware {
  authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return sendError(res, 401, {
          code: "UNAUTHORIZED",
          message: "No authorization header provided",
        });
      }

      const [bearer, token] = authHeader.split(" ");

      if (bearer !== "Bearer" || !token) {
        return sendError(res, 401, {
          code: "UNAUTHORIZED",
          message: "Invalid authorization header format",
        });
      }

      // Verify token
      const payload = jwt.verify(token, Env.JWT_ACCESS_SECRET) as {
        user_id: string;
      };

      if (!payload || !payload.user_id) {
        return sendError(res, 401, {
          code: "UNAUTHORIZED",
          message: "Invalid token",
        });
      }

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { user_id: payload.user_id },
      });

      if (!user) {
        return sendError(res, 401, {
          code: "UNAUTHORIZED",
          message: "Invalid user ID",
        });
      }

      // Attach user to request
      req.user_id = payload.user_id;
      req.user = {
        user_id: user.user_id,
        email: user.email,
        username: user.username,
      };

      next();
    } catch (error) {
      return sendError(res, 401, {
        code: "UNAUTHORIZED",
        message: "Invalid token",
      });
    }
  };
}
