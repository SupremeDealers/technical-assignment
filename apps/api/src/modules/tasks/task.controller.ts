import { Request, Response } from "express";
import db from "../../db";
import { z } from "zod";
import { sendError } from "../../errors";

export function getTasksByColumn(req: Request, res: Response) {
  const columnId = Number(req.params.columnId);

  const rows = db
    .prepare(
      `
      SELECT
        id,
        title,
        description,
        column_id,
        created_at
      FROM tasks
      WHERE column_id = ?
      ORDER BY created_at DESC
      `,
    )
    .all(columnId);

  res.json(rows);
}


export function createTask(req: Request, res: Response) {
  try {
    const columnId = req.params.columnId;
    const { title, description } = req.body;

    if (!title)
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Title is required",
      });

    const info = db
      .prepare(
        "INSERT INTO tasks (column_id, title, description) VALUES (?, ?, ?)",
      )
      .run(columnId, title, description || null);

    const id = info.lastInsertRowid as number;

    const task = db
      .prepare(
        "SELECT id, title, description, created_at FROM tasks WHERE id = ?",
      )
      .get(id);

    res.status(201).json(task);
  } catch (err) {
    console.error("CREATE TASK ERROR:", err);
    res.status(500).json({ error: String(err) });
  }
}

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  column_id: z.number().optional(),
});

export const updateTask = (req: Request, res: Response) => {
  const taskId = Number(req.params.taskId);

  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "BAD_REQUEST",
        message: "Invalid payload",
        details: parsed.error.issues,
      },
    });
  }

  const { title, column_id } = parsed.data;

  const existing = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId);

  if (!existing) {
    return res.status(404).json({
      error: { code: "NOT_FOUND", message: "Task not found" },
    });
  }

  db.prepare(
    `
    UPDATE tasks
    SET
      title = COALESCE(?, title),
      column_id = COALESCE(?, column_id)
    WHERE id = ?
  `,
  ).run(title, column_id, taskId);

  const updated = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId);

  res.json(updated);
};

export function deleteTask(req: Request, res: Response) {
  const id = Number(req.params.taskId);

  db.prepare("DELETE FROM tasks WHERE id = ?").run(id);

  res.json({ success: true });
}