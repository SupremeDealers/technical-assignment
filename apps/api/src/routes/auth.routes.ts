import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { hashPassword, comparePassword, signToken } from "../auth";
import { sendError } from "../errors";

const router = Router();

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid payload",
        details: validation.error.issues.map((e: any) => ({
          path: e.path.join("."),
          issue: e.message,
        })),
      });
    }

    const { email, password } = validation.data;

    // Check if user already exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return sendError(res, 409, {
        code: "CONFLICT",
        message: "User with this email already exists",
      });
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: { email, passwordHash },
    });

    // Generate token
    const token = signToken({ userId: user.id, email: user.email });

    res.status(201).json({
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    return sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to register user",
    });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid payload",
        details: validation.error.issues.map((e: any) => ({
          path: e.path.join("."),
          issue: e.message,
        })),
      });
    }

    const { email, password } = validation.data;

    // Find user
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return sendError(res, 401, {
        code: "UNAUTHORIZED",
        message: "Invalid credentials",
      });
    }

    // Verify password
    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return sendError(res, 401, {
        code: "UNAUTHORIZED",
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = signToken({ userId: user.id, email: user.email });

    res.json({
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to login",
    });
  }
});

export default router;
