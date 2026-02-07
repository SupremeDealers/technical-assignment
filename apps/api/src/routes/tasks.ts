import { Router, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import * as z from "zod";
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from "../schemas";
import { sendError } from "../errors";
import db from "../db";
import { authenticate, checkColumnAccess, checkTaskAccess, type AuthRequest } from "../middleware/auth";
import type { Task, TaskWithDetails, UserPublic, PaginatedResponse, Column } from "../types";

const router = Router();

router.use(authenticate);

function formatZodErrors(error: z.ZodError) {
  return error.issues.map((e) => ({
    path: e.path.join("."),
    issue: e.message,
  }));
}

function getTaskWithDetails(taskId: string): TaskWithDetails | null {
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId) as Task | undefined;

  if (!task) return null;

  const creator = db
    .prepare("SELECT id, email, name, created_at FROM users WHERE id = ?")
    .get(task.created_by) as UserPublic;

  let assignee: UserPublic | null = null;
  if (task.assignee_id) {
    assignee = db
      .prepare("SELECT id, email, name, created_at FROM users WHERE id = ?")
      .get(task.assignee_id) as UserPublic | null;
  }

  const commentCount = db.prepare("SELECT COUNT(*) as count FROM comments WHERE task_id = ?").get(taskId) as {
    count: number;
  };

  return {
    ...task,
    creator,
    assignee,
    comment_count: commentCount.count,
  };
}

router.get("/columns/:columnId/tasks", (req: AuthRequest, res: Response) => {
  try {
    const { columnId } = req.params;
    const userId = req.user!.id;

    if (!checkColumnAccess(userId, columnId)) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Column not found",
      });
    }

    const query = taskQuerySchema.parse(req.query);
    const { search, page, limit, sort, order } = query;

    let whereClause = "WHERE t.column_id = ?";
    const params: (string | number)[] = [columnId];

    if (search) {
      whereClause += " AND (t.title LIKE ? OR t.description LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    const sortColumn =
      sort === "createdAt" ? "t.created_at" : sort === "priority" ? "t.priority" : "t.position";

    const countResult = db
      .prepare(`SELECT COUNT(*) as total FROM tasks t ${whereClause}`)
      .get(...params) as { total: number };

    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const tasks = db
      .prepare(
        `
        SELECT t.*, 
               u.id as creator_id, u.email as creator_email, u.name as creator_name, u.created_at as creator_created_at,
               a.id as assignee_id, a.email as assignee_email, a.name as assignee_name, a.created_at as assignee_created_at,
               (SELECT COUNT(*) FROM comments c WHERE c.task_id = t.id) as comment_count
        FROM tasks t
        JOIN users u ON t.created_by = u.id
        LEFT JOIN users a ON t.assignee_id = a.id
        ${whereClause}
        ORDER BY ${sortColumn} ${order.toUpperCase()}
        LIMIT ? OFFSET ?
      `
      )
      .all(...params, limit, offset) as Array<Record<string, unknown>>;

    const tasksWithDetails: TaskWithDetails[] = tasks.map((row) => ({
      id: row.id as string,
      column_id: row.column_id as string,
      title: row.title as string,
      description: row.description as string | null,
      priority: row.priority as "low" | "medium" | "high",
      position: row.position as number,
      assignee_id: row.assignee_id as string | null,
      created_by: row.created_by as string,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
      creator: {
        id: row.creator_id as string,
        email: row.creator_email as string,
        name: row.creator_name as string,
        created_at: row.creator_created_at as string,
      },
      assignee: row.assignee_id
        ? {
            id: row.assignee_id as string,
            email: row.assignee_email as string,
            name: row.assignee_name as string,
            created_at: row.assignee_created_at as string,
          }
        : null,
      comment_count: row.comment_count as number,
    }));

    const response: PaginatedResponse<TaskWithDetails> = {
      data: tasksWithDetails,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };

    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid query parameters",
        details: formatZodErrors(error),
      });
    }
    console.error("Get tasks error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

router.post("/columns/:columnId/tasks", (req: AuthRequest, res: Response) => {
  try {
    const { columnId } = req.params;
    const userId = req.user!.id;
    const data = createTaskSchema.parse(req.body);

    if (!checkColumnAccess(userId, columnId)) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Column not found",
      });
    }

    if (data.assignee_id) {
      const assignee = db.prepare("SELECT id FROM users WHERE id = ?").get(data.assignee_id);
      if (!assignee) {
        return sendError(res, 400, {
          code: "BAD_REQUEST",
          message: "Assignee not found",
        });
      }
    }

    let position = data.position;
    if (position === undefined) {
      const maxPos = db
        .prepare("SELECT MAX(position) as max_pos FROM tasks WHERE column_id = ?")
        .get(columnId) as { max_pos: number | null };
      position = (maxPos?.max_pos ?? -1) + 1;
    }

    const taskId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(
      `INSERT INTO tasks (id, column_id, title, description, priority, position, assignee_id, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      taskId,
      columnId,
      data.title,
      data.description || null,
      data.priority,
      position,
      data.assignee_id || null,
      userId,
      now,
      now
    );

    const task = getTaskWithDetails(taskId);

    res.status(201).json({ task });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid payload",
        details: formatZodErrors(error),
      });
    }
    console.error("Create task error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

router.get("/tasks/:taskId", (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.user!.id;

    if (!checkTaskAccess(userId, taskId)) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    const task = getTaskWithDetails(taskId);

    if (!task) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    res.json({ task });
  } catch (error) {
    console.error("Get task error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

router.patch("/tasks/:taskId", (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.user!.id;
    const data = updateTaskSchema.parse(req.body);

    if (!checkTaskAccess(userId, taskId)) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId) as Task | undefined;

    if (!task) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    if (data.column_id && data.column_id !== task.column_id) {
      if (!checkColumnAccess(userId, data.column_id)) {
        return sendError(res, 400, {
          code: "BAD_REQUEST",
          message: "Target column not found or you don't have access",
        });
      }

      const targetColumn = db.prepare("SELECT * FROM columns WHERE id = ?").get(data.column_id) as Column | undefined;
      if (!targetColumn) {
        return sendError(res, 400, {
          code: "BAD_REQUEST",
          message: "Target column not found",
        });
      }
    }

    if (data.assignee_id) {
      const assignee = db.prepare("SELECT id FROM users WHERE id = ?").get(data.assignee_id);
      if (!assignee) {
        return sendError(res, 400, {
          code: "BAD_REQUEST",
          message: "Assignee not found",
        });
      }
    }

    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.title !== undefined) {
      updates.push("title = ?");
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      values.push(data.description);
    }
    if (data.priority !== undefined) {
      updates.push("priority = ?");
      values.push(data.priority);
    }
    if (data.assignee_id !== undefined) {
      updates.push("assignee_id = ?");
      values.push(data.assignee_id);
    }
    if (data.column_id !== undefined) {
      updates.push("column_id = ?");
      values.push(data.column_id);
    }
    if (data.position !== undefined) {
      updates.push("position = ?");
      values.push(data.position);
    }

    if (updates.length > 0) {
      updates.push("updated_at = ?");
      values.push(now);
      values.push(taskId);

      db.prepare(`UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    }

    const updatedTask = getTaskWithDetails(taskId);

    res.json({ task: updatedTask });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid payload",
        details: formatZodErrors(error),
      });
    }
    console.error("Update task error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

router.delete("/tasks/:taskId", (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.user!.id;

    if (!checkTaskAccess(userId, taskId)) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId);

    if (!task) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    db.prepare("DELETE FROM tasks WHERE id = ?").run(taskId);

    res.status(204).send();
  } catch (error) {
    console.error("Delete task error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

export default router;
