import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../../db";
import { sendError } from "../../errors";

const SECRET = process.env.JWT_SECRET || "dev-secret";

export async function register(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return sendError(res, 400, {
      code: "BAD_REQUEST",
      message: "Email and password is required",
    });
  }

  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (exists) {
    return sendError(res, 409, {
      code: "CONFLICT",
      message: "Email is already registered",
    });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const info = db
    .prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)")
    .run(email, password_hash);
  const id = info.lastInsertRowid as number;

  const token = jwt.sign({ userId: id }, SECRET, { expiresIn: "1d" });
  res.json({ token });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return sendError(res, 400, {
      code: "BAD_REQUEST",
      message: "Email and password is required",
    });
  }

  const user = db
    .prepare("SELECT id, password_hash FROM users WHERE email = ?")
    .get(email) as { id: number; password_hash: string } | undefined;
  if (!user) {
    return sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Invalid email or password",
    });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Invalid email or password",
    });
  }

  const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: "1d" });
  res.json({ token });
}
