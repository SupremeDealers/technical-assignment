import { Router } from "express";
import { getDb } from "../db/index";
import { sendError } from "../errors";
import { authenticate } from "../auth/middleware";
import { createCommentSchema } from "./schemas";
import { ZodError } from "zod";

const router = Router();

// All comment routes require authentication
router.use(authenticate);

/**
 * GET /tasks/:taskId/comments
 * Get all comments for a task
 */
router.get("/:taskId/comments", (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    
    if (isNaN(taskId)) {
      sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid task ID",
      });
      return;
    }

    const db = getDb();

    // Verify task exists
    const task = db.prepare("SELECT id FROM tasks WHERE id = ?").get(taskId);

    if (!task) {
      sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found",
      });
      return;
    }

    // Get comments with user info
    const comments = db
      .prepare(
        `
        SELECT 
          c.*,
          u.name as user_name,
          u.email as user_email
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.task_id = ?
        ORDER BY c.created_at ASC
      `
      )
      .all(taskId) as Array<{
        id: number;
        task_id: number;
        user_id: number;
        content: string;
        created_at: string;
        updated_at: string;
        user_name: string;
        user_email: string;
      }>;

    res.json({
      comments: comments.map((comment) => ({
        id: comment.id,
        taskId: comment.task_id,
        content: comment.content,
        user: {
          id: comment.user_id,
          name: comment.user_name,
          email: comment.user_email,
        },
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
      })),
    });
  } catch (error) {
    console.error("[comments] Get comments error:", error);
    sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to fetch comments",
    });
  }
});

/**
 * POST /tasks/:taskId/comments
 * Add a new comment to a task
 */
router.post("/:taskId/comments", (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    
    if (isNaN(taskId)) {
      sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid task ID",
      });
      return;
    }

    // Validate request body
    const data = createCommentSchema.parse(req.body);

    const db = getDb();

    // Verify task exists
    const task = db.prepare("SELECT id FROM tasks WHERE id = ?").get(taskId);

    if (!task) {
      sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found",
      });
      return;
    }

    // Insert comment
    const result = db
      .prepare(
        `INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)`
      )
      .run(taskId, req.user!.userId, data.content);

    const commentId = result.lastInsertRowid as number;

    // Fetch the created comment with user info
    const comment = db
      .prepare(
        `
        SELECT 
          c.*,
          u.name as user_name,
          u.email as user_email
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
      `
      )
      .get(commentId) as {
        id: number;
        task_id: number;
        user_id: number;
        content: string;
        created_at: string;
        updated_at: string;
        user_name: string;
        user_email: string;
      };

    res.status(201).json({
      id: comment.id,
      taskId: comment.task_id,
      content: comment.content,
      user: {
        id: comment.user_id,
        name: comment.user_name,
        email: comment.user_email,
      },
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      sendError(res, 400, {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: error.issues.map((e) => ({
          path: e.path.join("."),
          issue: e.message,
        })),
      });
      return;
    }

    console.error("[comments] Create comment error:", error);
    sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to create comment",
    });
  }
});

export default router;
