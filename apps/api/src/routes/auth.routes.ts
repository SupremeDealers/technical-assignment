import type { Router, Request, Response } from "express";
import { prisma } from "../db";
import {
  generateToken,
  hashPassword,
  comparePasswords,
  authMiddleware,
  AuthRequest,
} from "../auth";
import { sendError } from "../errors";

export function registerAuthRoutes(app: Router) {
  app.post("/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      // Validation
      if (!email || !password || !name) {
        sendError(res, 400, {
          code: "BAD_REQUEST",
          message: "Missing required fields: email, password, name",
        });
        return;
      }

      if (password.length < 6) {
        sendError(res, 400, {
          code: "BAD_REQUEST",
          message: "Password must be at least 6 characters",
        });
        return;
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        sendError(res, 409, {
          code: "CONFLICT",
          message: "User with this email already exists",
        });
        return;
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      });

      const token = generateToken(user.id);

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      });
    } catch (error) {
      console.error("Register error:", error);
      sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to register user",
      });
    }
  });

  app.post("/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        sendError(res, 400, {
          code: "BAD_REQUEST",
          message: "Missing required fields: email, password",
        });
        return;
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        sendError(res, 401, {
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
        return;
      }

      // Verify password
      const isPasswordValid = await comparePasswords(password, user.password);
      if (!isPasswordValid) {
        sendError(res, 401, {
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
        return;
      }

      const token = generateToken(user.id);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to login",
      });
    }
  });

  app.get(
    "/auth/me",
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        const userId = req.userId!;

        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          sendError(res, 401, {
            code: "UNAUTHORIZED",
            message: "User not found",
          });
          return;
        }

        res.json({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        });
      } catch (error) {
        console.error("Me error:", error);
        sendError(res, 500, {
          code: "INTERNAL",
          message: "Failed to fetch user",
        });
      }
    },
  );
}
