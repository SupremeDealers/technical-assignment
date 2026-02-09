import { Router } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { registerSchema, loginSchema } from "../schemas";
import { sendError } from "../errors";
import db from "../db";
import { config } from "../config";
import { generateToken, authenticate, type AuthRequest } from "../middleware/auth";
import type { User, UserPublic, AuthResponse } from "../types";
import * as z from "zod";

const router = Router();

function formatZodErrors(error: z.ZodError) {
  return error.issues.map((e) => ({
    path: e.path.join("."),
    issue: e.message,
  }));
}

router.post("/register", async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(data.email);
    if (existing) {
      return sendError(res, 409, {
        code: "CONFLICT",
        message: "Email already registered",
      });
    }

    const passwordHash = await bcrypt.hash(data.password, config.bcryptRounds);

    const userId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(
      `INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(userId, data.email, passwordHash, data.name, now, now);

    const token = generateToken(userId);

    const user: UserPublic = {
      id: userId,
      email: data.email,
      name: data.name,
      is_admin: false,
      created_at: now,
    };

    const boardId = uuidv4();
    db.prepare(
      `INSERT INTO boards (id, name, description, owner_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(boardId, "My Board", "Your first kanban board", userId, now, now);

    const columns = ["To Do", "In Progress", "Done"];
    columns.forEach((name, index) => {
      const columnId = uuidv4();
      db.prepare(
        `INSERT INTO columns (id, board_id, name, position, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(columnId, boardId, name, index, now, now);
    });

    const response: AuthResponse = { user, token };
    res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid payload",
        details: formatZodErrors(error),
      });
    }
    console.error("Register error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(data.email) as User | undefined;

    if (!user) {
      return sendError(res, 401, {
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    const validPassword = await bcrypt.compare(data.password, user.password_hash);
    if (!validPassword) {
      return sendError(res, 401, {
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user.id);

    const userPublic: UserPublic = {
      id: user.id,
      email: user.email,
      name: user.name,
      is_admin: Boolean(user.is_admin),
      created_at: user.created_at,
    };

    const response: AuthResponse = { user: userPublic, token };
    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid payload",
        details: formatZodErrors(error),
      });
    }
    console.error("Login error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

router.get("/me", authenticate, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

export default router;
