import { Router, Request, Response } from "express";
import db from "../db.js";
import { authMiddleware } from "../auth.js";
import { validate } from "../middleware.js";
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from "../schemas.js";
import { sendError } from "../errors.js";

const router = Router();
router.use(authMiddleware);

// GET /columns/:columnId/tasks
router.get("/columns/:columnId/tasks", (req: Request, res: Response) => {
  const col = db.prepare("SELECT * FROM columns WHERE id = ?").get(req.params.columnId) as any;
  if (!col) {
    return sendError(res, 404, { code: "NOT_FOUND", message: "Column not found" });
  }

  const parsed = taskQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return sendError(res, 400, {
      code: "BAD_REQUEST",
      message: "Invalid query parameters",
      details: parsed.error.errors.map((e) => ({ path: e.path.join("."), issue: e.message })),
    });
  }

  const { search, page, limit, sort } = parsed.data;
  const offset = (page - 1) * limit;

  let where = "t.column_id = ?";
  const params: any[] = [col.id];

  if (search) {
    where += " AND (t.title LIKE ? OR t.description LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  const sortMap: Record<string, string> = {
    createdAt: "t.created_at DESC",
    priority: "CASE t.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END ASC",
    position: "t.position ASC",
  };

  const countRow = db.prepare(`SELECT COUNT(*) as total FROM tasks t WHERE ${where}`).get(...params) as any;

  const tasks = db
    .prepare(
      `SELECT t.*, u.username as assignee_username
       FROM tasks t
       LEFT JOIN users u ON u.id = t.assignee_id
       WHERE ${where}
       ORDER BY ${sortMap[sort]}
       LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset);

  res.json({
    tasks,
    pagination: {
      page,
      limit,
      total: countRow.total,
      totalPages: Math.ceil(countRow.total / limit),
    },
  });
});

// POST /columns/:columnId/tasks
router.post("/columns/:columnId/tasks", validate(createTaskSchema), (req: Request, res: Response) => {
  const col = db.prepare("SELECT * FROM columns WHERE id = ?").get(req.params.columnId) as any;
  if (!col) {
    return sendError(res, 404, { code: "NOT_FOUND", message: "Column not found" });
  }

  const { title, description, priority, assignee_id } = req.body;

  const maxPos = db
    .prepare("SELECT COALESCE(MAX(position), -1) as maxPos FROM tasks WHERE column_id = ?")
    .get(col.id) as any;

  const result = db
    .prepare(
      "INSERT INTO tasks (column_id, title, description, priority, assignee_id, position) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(col.id, title, description ?? "", priority ?? "medium", assignee_id ?? null, maxPos.maxPos + 1);

  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ task });
});

// PATCH /tasks/:taskId
router.patch("/tasks/:taskId", validate(updateTaskSchema), (req: Request, res: Response) => {
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.taskId) as any;
  if (!task) {
    return sendError(res, 404, { code: "NOT_FOUND", message: "Task not found" });
  }

  const updates: string[] = [];
  const values: any[] = [];

  for (const [key, value] of Object.entries(req.body)) {
    if (value !== undefined) {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')");
    values.push(task.id);
    db.prepare(`UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`).run(...values);
  }

  const updated = db
    .prepare(
      `SELECT t.*, u.username as assignee_username
       FROM tasks t
       LEFT JOIN users u ON u.id = t.assignee_id
       WHERE t.id = ?`
    )
    .get(task.id);
  res.json({ task: updated });
});

// DELETE /tasks/:taskId
router.delete("/tasks/:taskId", (req: Request, res: Response) => {
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.taskId) as any;
  if (!task) {
    return sendError(res, 404, { code: "NOT_FOUND", message: "Task not found" });
  }

  db.prepare("DELETE FROM tasks WHERE id = ?").run(task.id);
  res.json({ ok: true });
});

// GET /tasks/:taskId
router.get("/tasks/:taskId", (req: Request, res: Response) => {
  const task = db
    .prepare(
      `SELECT t.*, u.username as assignee_username
       FROM tasks t
       LEFT JOIN users u ON u.id = t.assignee_id
       WHERE t.id = ?`
    )
    .get(req.params.taskId) as any;

  if (!task) {
    return sendError(res, 404, { code: "NOT_FOUND", message: "Task not found" });
  }
  res.json({ task });
});

export default router;
