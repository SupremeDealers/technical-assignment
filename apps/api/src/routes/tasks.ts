import { Router, type Response } from "express";
import { db } from "../db/db";
import { sendError } from "../errors";
import { type AuthRequest, authenticate } from "../auth";
import { updateTaskSchema } from "../validation";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get a specific task
router.get("/:taskId", async (req: AuthRequest, res: Response) => {
  try {
    const task = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(req.params.taskId);

    if (!task) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    res.json(task);
  } catch (error) {
    console.error("[tasks/:taskId] Error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to fetch task",
    });
  }
});

// Update a task (including moving to different column)
router.patch("/:taskId", async (req: AuthRequest, res: Response) => {
  try {
    const result = updateTaskSchema.safeParse(req.body);

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

    const updates: string[] = ["updated_at = CURRENT_TIMESTAMP"];
    const values: (string | number)[] = [];

    if (result.data.title !== undefined) {
      updates.push("title = ?");
      values.push(result.data.title);
    }

    if (result.data.description !== undefined) {
      updates.push("description = ?");
      values.push(result.data.description);
    }

    if (result.data.priority !== undefined) {
      updates.push("priority = ?");
      values.push(result.data.priority);
    }

    if (result.data.position !== undefined) {
      updates.push("position = ?");
      values.push(result.data.position);
    }

    if (result.data.column_id !== undefined) {
      updates.push("column_id = ?");
      values.push(result.data.column_id);
    }

    values.push(req.params.taskId);

    db.prepare(`UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`).run(
      ...values
    );

    const task = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(req.params.taskId);

    if (!task) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    res.json(task);
  } catch (error) {
    console.error("[tasks/:taskId] Error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to update task",
    });
  }
});

// Delete a task
router.delete("/:taskId", async (req: AuthRequest, res: Response) => {
  try {
    const task = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(req.params.taskId);

    if (!task) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.taskId);

    res.status(204).send();
  } catch (error) {
    console.error("[tasks/:taskId] Error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to delete task",
    });
  }
});

// Get comments for a task
router.get("/:taskId/comments", async (req: AuthRequest, res: Response) => {
  try {
    const comments = db
      .prepare(`
        SELECT 
          c.*,
          u.name as user_name,
          u.email as user_email
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.task_id = ?
        ORDER BY c.created_at ASC
      `)
      .all(req.params.taskId);

    res.json(comments);
  } catch (error) {
    console.error("[tasks/:taskId/comments] Error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to fetch comments",
    });
  }
});

// Create a comment on a task
router.post("/:taskId/comments", async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Content is required",
      });
    }

    const stmt = db.prepare(
      "INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)"
    );
    const info = stmt.run(req.params.taskId, req.userId, content.trim());

    const comment = db
      .prepare(`
        SELECT 
          c.*,
          u.name as user_name,
          u.email as user_email
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
      `)
      .get(info.lastInsertRowid);

    res.status(201).json(comment);
  } catch (error) {
    console.error("[tasks/:taskId/comments] Error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to create comment",
    });
  }
});

export default router;
