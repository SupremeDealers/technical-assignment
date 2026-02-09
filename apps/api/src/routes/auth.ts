import { Router, type Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db/db";
import { generateToken, authenticate, type AuthRequest } from "../auth";
import { sendError } from "../errors";
import { registerSchema, loginSchema } from "../validation";

const router = Router();

router.post("/register", async (req, res: Response) => {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid request body",
        details: result.error.issues.map((e) => ({
          path: e.path.join("."),
          issue: e.message,
        })),
      });
    }

    const { email, password, name } = result.data;

    // Check if user already exists
    const existingUser = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email);

    if (existingUser) {
      return sendError(res, 409, {
        code: "CONFLICT",
        message: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const stmt = db.prepare(
      "INSERT INTO users (email, password, name) VALUES (?, ?, ?)"
    );
    const info = stmt.run(email, hashedPassword, name);

    const userId = info.lastInsertRowid as number;
    const token = generateToken(userId);

    // Return user data (without password)
    const user = db
      .prepare("SELECT id, email, name, created_at FROM users WHERE id = ?")
      .get(userId);

    res.status(201).json({
      user,
      token,
    });
  } catch (error) {
    console.error("[auth/register] Error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to register user",
    });
  }
});

router.post("/login", async (req, res: Response) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid request body",
        details: result.error.issues.map((e) => ({
          path: e.path.join("."),
          issue: e.message,
        })),
      });
    }

    const { email, password } = result.data;

    // Find user
    const user = db
      .prepare("SELECT id, email, name, password, created_at FROM users WHERE email = ?")
      .get(email) as { id: number; email: string; name: string; password: string; created_at: string } | undefined;

    if (!user) {
      return sendError(res, 401, {
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return sendError(res, 401, {
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user.id);

    // Return user data (without password)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("[auth/login] Error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to login",
    });
  }
});

router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = db
      .prepare("SELECT id, email, name, created_at FROM users WHERE id = ?")
      .get(req.userId);

    if (!user) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.error("[auth/me] Error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to fetch user",
    });
  }
});

export default router;
