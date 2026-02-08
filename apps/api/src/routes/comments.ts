import { Router, Request, Response } from "express";
import db from "../db.js";
import { authMiddleware } from "../auth.js";
import { validate } from "../middleware.js";
import { createCommentSchema } from "../schemas.js";
import { sendError } from "../errors.js";

const router = Router();
router.use(authMiddleware);

// GET /tasks/:taskId/comments
router.get("/:taskId/comments", (req: Request, res: Response) => {
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.taskId) as any;
  if (!task) {
    return sendError(res, 404, { code: "NOT_FOUND", message: "Task not found" });
  }

  const comments = db
    .prepare(
      `SELECT c.id, c.task_id, c.user_id, c.body, c.created_at, u.username
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.task_id = ?
       ORDER BY c.created_at ASC`
    )
    .all(task.id);

  res.json({ comments });
});

// POST /tasks/:taskId/comments
router.post("/:taskId/comments", validate(createCommentSchema), (req: Request, res: Response) => {
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.taskId) as any;
  if (!task) {
    return sendError(res, 404, { code: "NOT_FOUND", message: "Task not found" });
  }

  const { body } = req.body;
  const result = db
    .prepare("INSERT INTO comments (task_id, user_id, body) VALUES (?, ?, ?)")
    .run(task.id, req.user!.userId, body);

  const comment = db
    .prepare(
      `SELECT c.id, c.task_id, c.user_id, c.body, c.created_at, u.username
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.id = ?`
    )
    .get(result.lastInsertRowid);

  res.status(201).json({ comment });
});

export default router;
