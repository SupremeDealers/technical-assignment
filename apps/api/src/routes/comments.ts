import { Router, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import * as z from "zod";
import { createCommentSchema, updateCommentSchema } from "../schemas";
import { sendError } from "../errors";
import db from "../db";
import { authenticate, checkTaskAccess, type AuthRequest } from "../middleware/auth";
import type { Comment, CommentWithUser, UserPublic, Task } from "../types";
import { logActivity, createNotification } from "./features";

const router = Router();

router.use(authenticate);

function formatZodErrors(error: z.ZodError) {
  return error.issues.map((e) => ({
    path: e.path.join("."),
    issue: e.message,
  }));
}

router.get("/tasks/:taskId/comments", (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.user!.id;

    if (!checkTaskAccess(userId, taskId)) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    const comments = db
      .prepare(
        `
        SELECT c.*, 
               u.id as user_id, u.email as user_email, u.name as user_name, u.is_admin as user_is_admin, u.created_at as user_created_at
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.task_id = ?
        ORDER BY c.created_at ASC
      `
      )
      .all(taskId) as Array<Record<string, unknown>>;

    const commentsWithUser: CommentWithUser[] = comments.map((row) => ({
      id: row.id as string,
      task_id: row.task_id as string,
      user_id: row.user_id as string,
      content: row.content as string,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
      user: {
        id: row.user_id as string,
        email: row.user_email as string,
        name: row.user_name as string,
        is_admin: Boolean(row.user_is_admin),
        created_at: row.user_created_at as string,
      },
    }));

    res.json({ comments: commentsWithUser });
  } catch (error) {
    console.error("Get comments error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

router.post("/tasks/:taskId/comments", (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.user!.id;
    const data = createCommentSchema.parse(req.body);

    if (!checkTaskAccess(userId, taskId)) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    const commentId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(
      `INSERT INTO comments (id, task_id, user_id, content, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(commentId, taskId, userId, data.content, now, now);

    const user = db
      .prepare("SELECT id, email, name, is_admin, created_at FROM users WHERE id = ?")
      .get(userId) as UserPublic;

    // Get task and board info for activity logging and notifications
    const task = db.prepare(`
      SELECT t.title, t.created_by, t.assignee_id, c.board_id 
      FROM tasks t 
      JOIN columns c ON t.column_id = c.id 
      WHERE t.id = ?
    `).get(taskId) as { title: string; created_by: string; assignee_id: string | null; board_id: string };

    // Log activity
    logActivity(task.board_id, userId, "commented", "task", task.title, taskId, data.content.substring(0, 100));

    // Notify task creator if different from commenter
    if (task.created_by !== userId) {
      createNotification(
        task.created_by,
        "comment_added",
        "New Comment",
        `${user.name} commented on "${task.title}"`,
        `/boards/${task.board_id}`
      );
    }

    // Notify assignee if different from commenter and creator
    if (task.assignee_id && task.assignee_id !== userId && task.assignee_id !== task.created_by) {
      createNotification(
        task.assignee_id,
        "comment_added",
        "New Comment",
        `${user.name} commented on "${task.title}"`,
        `/boards/${task.board_id}`
      );
    }

    const comment: CommentWithUser = {
      id: commentId,
      task_id: taskId,
      user_id: userId,
      content: data.content,
      created_at: now,
      updated_at: now,
      user,
    };

    res.status(201).json({ comment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid payload",
        details: formatZodErrors(error),
      });
    }
    console.error("Create comment error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

router.patch("/comments/:commentId", (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.user!.id;
    const data = updateCommentSchema.parse(req.body);

    const comment = db.prepare("SELECT * FROM comments WHERE id = ?").get(commentId) as Comment | undefined;

    if (!comment) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Comment not found",
      });
    }

    if (comment.user_id !== userId) {
      return sendError(res, 403, {
        code: "FORBIDDEN",
        message: "You can only edit your own comments",
      });
    }

    const now = new Date().toISOString();

    db.prepare("UPDATE comments SET content = ?, updated_at = ? WHERE id = ?").run(
      data.content,
      now,
      commentId
    );

    const user = db
      .prepare("SELECT id, email, name, created_at FROM users WHERE id = ?")
      .get(userId) as UserPublic;

    const updatedComment: CommentWithUser = {
      ...comment,
      content: data.content,
      updated_at: now,
      user,
    };

    res.json({ comment: updatedComment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid payload",
        details: formatZodErrors(error),
      });
    }
    console.error("Update comment error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

router.delete("/comments/:commentId", (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.user!.id;

    const comment = db.prepare("SELECT * FROM comments WHERE id = ?").get(commentId) as Comment | undefined;

    if (!comment) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Comment not found",
      });
    }

    if (comment.user_id !== userId) {
      return sendError(res, 403, {
        code: "FORBIDDEN",
        message: "You can only delete your own comments",
      });
    }

    db.prepare("DELETE FROM comments WHERE id = ?").run(commentId);

    res.status(204).send();
  } catch (error) {
    console.error("Delete comment error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

export default router;
