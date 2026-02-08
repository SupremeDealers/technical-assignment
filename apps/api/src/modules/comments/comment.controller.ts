import { Request, Response } from "express";
import db from "../../db";

export function getComments(req: Request, res: Response) {
  const taskId = Number(req.params.taskId);

  const rows = db
    .prepare(
      `
      SELECT
        c.id,
        c.content,
        c.created_at,
        u.email as userEmail
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.task_id = ?
      ORDER BY c.created_at ASC
      `,
    )
    .all(taskId);

  res.json(rows);
}

export function addComment(req: Request, res: Response) {
  const taskId = Number(req.params.taskId);
  const { content } = req.body;
  const userId = (req as any).user.userId;

  const info = db
    .prepare(
      `
      INSERT INTO comments
      (task_id, user_id, content)
      VALUES (?, ?, ?)
      `,
    )
    .run(taskId, userId, content);

  const comment = db
    .prepare(
      `
      SELECT id, content, created_at
      FROM comments
      WHERE id = ?
      `,
    )
    .get(info.lastInsertRowid);

  res.status(201).json(comment);
}

export function deleteComment(req: Request, res: Response) {
  const id = Number(req.params.commentId);

  db.prepare("DELETE FROM comments WHERE id = ?").run(id);

  res.json({ success: true });
}
