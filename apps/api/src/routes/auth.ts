import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import db from "../db.js";
import { signToken } from "../auth.js";
import { validate } from "../middleware.js";
import { registerSchema, loginSchema } from "../schemas.js";
import { sendError } from "../errors.js";

const router = Router();

// POST /auth/register
router.post("/register", validate(registerSchema), (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  // Check existing
  const existing = db.prepare("SELECT id FROM users WHERE email = ? OR username = ?").get(email, username) as any;
  if (existing) {
    return sendError(res, 409, {
      code: "CONFLICT",
      message: "User with that email or username already exists",
    });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)").run(username, email, hash);

  const token = signToken({ userId: Number(result.lastInsertRowid), username });
  res.status(201).json({
    user: { id: Number(result.lastInsertRowid), username, email },
    token,
  });
});

// POST /auth/login
router.post("/login", validate(loginSchema), (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = db.prepare("SELECT id, username, email, password FROM users WHERE email = ?").get(email) as any;
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Invalid email or password",
    });
  }

  const token = signToken({ userId: user.id, username: user.username });
  res.json({
    user: { id: user.id, username: user.username, email: user.email },
    token,
  });
});

export default router;
