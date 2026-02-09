import { Router } from "express";
import { getDb } from "../db/index";
import { sendError } from "../errors";
import { registerSchema, loginSchema } from "./schemas";
import { hashPassword, comparePassword, generateToken } from "./utils";
import { ZodError } from "zod";

const router = Router();

/**
 * POST /auth/register
 * Register a new user
 */
router.post("/register", async (req, res) => {
  try {
    // Validate request body
    const data = registerSchema.parse(req.body);

    const db = getDb();

    // Check if user already exists
    const existing = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(data.email);

    if (existing) {
      sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "User with this email already exists",
      });
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Insert user
    const result = db
      .prepare(
        `INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)`
      )
      .run(data.email, passwordHash, data.name);

    const userId = result.lastInsertRowid as number;

    // Generate token
    const token = generateToken(userId, data.email);

    res.status(201).json({
      user: {
        id: userId,
        email: data.email,
        name: data.name,
      },
      token,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      sendError(res, 400, {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: error.issues.map((e) => ({
          path: e.path.join("."),
          issue: e.message,
        })),
      });
      return;
    }

    console.error("[auth] Register error:", error);
    sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to register user",
    });
  }
});

/**
 * POST /auth/login
 * Login an existing user
 */
router.post("/login", async (req, res) => {
  try {
    // Validate request body
    const data = loginSchema.parse(req.body);

    const db = getDb();

    // Find user
    const user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(data.email) as
      | { id: number; email: string; password_hash: string; name: string }
      | undefined;

    if (!user) {
      sendError(res, 401, {
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
      return;
    }

    // Verify password
    const isValid = await comparePassword(data.password, user.password_hash);

    if (!isValid) {
      sendError(res, 401, {
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
      return;
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      sendError(res, 400, {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: error.issues.map((e) => ({
          path: e.path.join("."),
          issue: e.message,
        })),
      });
      return;
    }

    console.error("[auth] Login error:", error);
    sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to login",
    });
  }
});

export default router;
