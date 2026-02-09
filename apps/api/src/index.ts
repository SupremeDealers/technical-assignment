import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendError } from "./errors";
import db, { UserRow, TaskRow, CommentRow } from "./db";

const app = express();
const JWT_SECRET = "super-secret-key";

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// --- Zod Schemas ---

const registerSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(6),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const taskCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["todo", "in-progress", "done"]).optional(),
});

const taskUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["todo", "in-progress", "done"]).optional(),
});

const commentCreateSchema = z.object({
  text: z.string().min(1),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(100),
  search: z.string().optional(),
});

// --- Middleware ---

const authenticate = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Missing token",
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      username: string;
    };
    (req as any).user = payload;
    next();
  } catch (err) {
    return sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Invalid token",
    });
  }
};

const validate =
  (schema: z.ZodSchema) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return sendError(res, 400, {
          code: "BAD_REQUEST",
          message: "Validation failed",
          details: err.issues,
        });
      }
      next(err);
    }
  };

// --- Routes ---

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// Auth
app.post("/auth/register", validate(registerSchema), async (req, res) => {
  const { username, password } = req.body;

  const existing = db
    .prepare("SELECT id FROM users WHERE username = ?")
    .get(username);
  if (existing) {
    return sendError(res, 409, {
      code: "CONFLICT",
      message: "Username already exists",
    });
  }

  const id = Math.random().toString(36).slice(2);
  const passwordHash = await bcrypt.hash(password, 10);
  db.prepare(
    "INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)",
  ).run(id, username, passwordHash);

  const token = jwt.sign({ userId: id, username }, JWT_SECRET);
  res.status(201).json({ token, user: { id, username } });
});

app.post("/auth/login", validate(loginSchema), async (req, res) => {
  const { username, password } = req.body;
  const user = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username) as UserRow | undefined;

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Invalid credentials",
    });
  }

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
  );
  res.json({ token, user: { id: user.id, username: user.username } });
});

app.get("/auth/me", authenticate, (req, res) => {
  res.json({ user: (req as any).user });
});

// Tasks
app.get("/tasks", authenticate, (req, res) => {
  const { page, limit, search } = paginationSchema.parse(req.query);
  const offset = (page - 1) * limit;

  let query = "SELECT * FROM tasks";
  let countQuery = "SELECT COUNT(*) as total FROM tasks";
  const params: any[] = [];

  if (search) {
    query += " WHERE title LIKE ? OR description LIKE ?";
    countQuery += " WHERE title LIKE ? OR description LIKE ?";
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam);
  }

  query += " LIMIT ? OFFSET ?";
  const total = (
    db.prepare(countQuery).get(...params.slice(0, search ? 2 : 0)) as any
  ).total;
  const tasks = db.prepare(query).all(...params, limit, offset) as TaskRow[];

  res.json({
    tasks,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});

app.post("/tasks", authenticate, validate(taskCreateSchema), (req, res) => {
  const { title, description = "", status = "todo" } = req.body;
  const userId = (req as any).user.userId;

  const id = Math.random().toString(36).slice(2);
  db.prepare(
    "INSERT INTO tasks (id, title, description, status, user_id) VALUES (?, ?, ?, ?, ?)",
  ).run(id, title, description, status, userId);

  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  res.status(201).json(task);
});

app.patch(
  "/tasks/:id",
  authenticate,
  validate(taskUpdateSchema),
  (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as
      | TaskRow
      | undefined;
    if (!task) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    const fields = Object.keys(updates)
      .map((k) => `${k} = ?`)
      .join(", ");
    const values = Object.values(updates);

    if (fields) {
      db.prepare(`UPDATE tasks SET ${fields} WHERE id = ?`).run(...values, id);
    }

    const updatedTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
    res.json(updatedTask);
  },
);

app.delete("/tasks/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);

  if (result.changes === 0) {
    return sendError(res, 404, {
      code: "NOT_FOUND",
      message: "Task not found",
    });
  }

  res.status(204).send();
});

// Comments
app.get("/tasks/:id/comments", authenticate, (req, res) => {
  const { id } = req.params;
  const comments = db
    .prepare(
      `
    SELECT c.*, u.username 
    FROM comments c 
    JOIN users u ON c.user_id = u.id 
    WHERE c.task_id = ?
    ORDER BY c.created_at DESC
  `,
    )
    .all(id) as CommentRow[];

  res.json({ comments });
});

app.post(
  "/tasks/:id/comments",
  authenticate,
  validate(commentCreateSchema),
  (req, res) => {
    const { id: taskId } = req.params;
    const { text } = req.body;
    const userId = (req as any).user.userId;

    const task = db.prepare("SELECT id FROM tasks WHERE id = ?").get(taskId);
    if (!task) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    const id = Math.random().toString(36).slice(2);
    db.prepare(
      "INSERT INTO comments (id, task_id, user_id, text) VALUES (?, ?, ?, ?)",
    ).run(id, taskId, userId, text);

    const comment = db
      .prepare(
        `
    SELECT c.*, u.username 
    FROM comments c 
    JOIN users u ON c.user_id = u.id 
    WHERE c.id = ?
  `,
      )
      .get(id);

    res.status(201).json(comment);
  },
);

app.use((req, res) => {
  sendError(res, 404, {
    code: "NOT_FOUND",
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}`);
});

export default app;
