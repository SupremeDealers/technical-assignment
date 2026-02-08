import db from "../db/client";
import bcrypt from "bcryptjs";
import { signToken } from "../utils/jwt";
import { ServiceError } from "../utils/errors";
import { registerSchema, loginSchema } from "../validation/auth.schema";
import { z } from "zod";

export const register = async (data: z.infer<typeof registerSchema>) => {
  const { email, password } = data;

  const existingUser = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email);
  if (existingUser) {
    throw new ServiceError(409, "CONFLICT", "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const insert = db.prepare(
    "INSERT INTO users (email, password) VALUES (?, ?)",
  );
  const result = insert.run(email, hashedPassword);

  // Auto-create a default board for the user
  const insertBoard = db.prepare(
    "INSERT INTO boards (name, owner_id) VALUES (?, ?)",
  );
  const boardRes = insertBoard.run("My Board", result.lastInsertRowid);

  // Default columns
  const insertCol = db.prepare(
    'INSERT INTO columns (board_id, title, "order") VALUES (?, ?, ?)',
  );
  insertCol.run(boardRes.lastInsertRowid, "To Do", 0);
  insertCol.run(boardRes.lastInsertRowid, "In Progress", 1);
  insertCol.run(boardRes.lastInsertRowid, "Done", 2);

  const token = signToken({ userId: result.lastInsertRowid as number, email });
  return { token, user: { id: result.lastInsertRowid, email } };
};

export const login = async (data: z.infer<typeof loginSchema>) => {
  const { email, password } = data;

  const user: any = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ServiceError(401, "UNAUTHORIZED", "Invalid credentials");
  }

  const token = signToken({ userId: user.id, email });
  return { token, user: { id: user.id, email: user.email } };
};
