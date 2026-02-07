import { Router, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import * as z from "zod";
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from "../schemas";
import { sendError } from "../errors";
import db from "../db";
import { authenticate, checkColumnAccess, checkTaskAccess, canModifyTask, type AuthRequest } from "../middleware/auth";
import type { Task, TaskWithDetails, UserPublic, PaginatedResponse, Column } from "../types";
import { logActivity, createNotification } from "./features";

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
    .prepare("SELECT id, email, name, is_admin, created_at FROM users WHERE id = ?")
    .get(task.created_by) as UserPublic;

  let assignee: UserPublic | null = null;
  if (task.assignee_id) {
    assignee = db
      .prepare("SELECT id, email, name, is_admin, created_at FROM users WHERE id = ?")
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

// Helper to check column task limit
function checkColumnTaskLimit(columnId: string, excludeTaskId?: string): { allowed: boolean; max_tasks: number | null; current_count: number } {
  const column = db.prepare("SELECT max_tasks FROM columns WHERE id = ?").get(columnId) as { max_tasks: number | null } | undefined;
  
  if (!column || column.max_tasks === null) {
    return { allowed: true, max_tasks: null, current_count: 0 };
  }
  
  let query = "SELECT COUNT(*) as count FROM tasks WHERE column_id = ?";
  const params: string[] = [columnId];
  
  if (excludeTaskId) {
    query += " AND id != ?";
    params.push(excludeTaskId);
  }
  
  const result = db.prepare(query).get(...params) as { count: number };
  
  return {
    allowed: result.count < column.max_tasks,
    max_tasks: column.max_tasks,
    current_count: result.count,
  };
}

// Helper to check for duplicate task title in column
function checkDuplicateTitle(columnId: string, title: string, excludeTaskId?: string): boolean {
  let query = "SELECT 1 FROM tasks WHERE column_id = ? AND LOWER(title) = LOWER(?)";
  const params: string[] = [columnId, title];
  
  if (excludeTaskId) {
    query += " AND id != ?";
    params.push(excludeTaskId);
  }
  
  const result = db.prepare(query).get(...params);
  return !!result;
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
    const { search, page, limit, sort, order, status, priority, assignee_id, overdue } = query;

    let whereClause = "WHERE t.column_id = ?";
    const params: (string | number)[] = [columnId];

    if (search) {
      whereClause += " AND (t.title LIKE ? OR t.description LIKE ? OR t.labels LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (status) {
      whereClause += " AND t.status = ?";
      params.push(status);
    }

    if (priority) {
      whereClause += " AND t.priority = ?";
      params.push(priority);
    }

    if (assignee_id) {
      whereClause += " AND t.assignee_id = ?";
      params.push(assignee_id);
    }

    if (overdue) {
      whereClause += " AND t.due_date IS NOT NULL AND t.due_date < datetime('now') AND t.status != 'completed'";
    }

    const sortColumn =
      sort === "createdAt" ? "t.created_at" 
      : sort === "priority" ? "t.priority" 
      : sort === "dueDate" ? "t.due_date"
      : sort === "status" ? "t.status"
      : "t.position";

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
               u.id as creator_id, u.email as creator_email, u.name as creator_name, u.is_admin as creator_is_admin, u.created_at as creator_created_at,
               a.id as assignee_user_id, a.email as assignee_email, a.name as assignee_name, a.is_admin as assignee_is_admin, a.created_at as assignee_created_at,
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
      status: row.status as "todo" | "in_progress" | "completed",
      position: row.position as number,
      assignee_id: row.assignee_id as string | null,
      created_by: row.created_by as string,
      due_date: row.due_date as string | null,
      labels: row.labels as string | null,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
      creator: {
        id: row.creator_id as string,
        email: row.creator_email as string,
        name: row.creator_name as string,
        is_admin: Boolean(row.creator_is_admin),
        created_at: row.creator_created_at as string,
      },
      assignee: row.assignee_user_id
        ? {
            id: row.assignee_user_id as string,
            email: row.assignee_email as string,
            name: row.assignee_name as string,
            is_admin: Boolean(row.assignee_is_admin),
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

    // Check column task limit
    const limitCheck = checkColumnTaskLimit(columnId);
    if (!limitCheck.allowed) {
      return sendError(res, 400, {
        code: "COLUMN_TASK_LIMIT_REACHED",
        message: `This column has reached its maximum limit of ${limitCheck.max_tasks} tasks`,
      });
    }

    // Check for duplicate title
    if (checkDuplicateTitle(columnId, data.title)) {
      return sendError(res, 400, {
        code: "DUPLICATE_TITLE",
        message: "A task with this title already exists in this column",
      });
    }

    // Validate due date if provided (must be in the future)
    if (data.due_date) {
      const dueDate = new Date(data.due_date);
      if (dueDate < new Date()) {
        return sendError(res, 400, {
          code: "INVALID_DUE_DATE",
          message: "Due date must be in the future",
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
      `INSERT INTO tasks (id, column_id, title, description, priority, status, position, assignee_id, created_by, due_date, labels, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      taskId,
      columnId,
      data.title,
      data.description || null,
      data.priority,
      data.status,
      position,
      data.assignee_id || null,
      userId,
      data.due_date || null,
      data.labels || null,
      now,
      now
    );

    // Get board_id for activity logging
    const column = db.prepare("SELECT board_id FROM columns WHERE id = ?").get(columnId) as { board_id: string };
    
    // Log activity
    logActivity(column.board_id, userId, "created", "task", data.title, taskId);

    // Send notification if task is assigned to someone else
    if (data.assignee_id && data.assignee_id !== userId) {
      const user = db.prepare("SELECT name FROM users WHERE id = ?").get(userId) as { name: string };
      createNotification(
        data.assignee_id,
        "task_assigned",
        "New Task Assigned",
        `${user.name} assigned you to "${data.title}"`,
        `/boards/${column.board_id}`
      );
    }

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

    // Determine target column
    const targetColumnId = data.column_id || task.column_id;

    // Check if moving to a different column
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

      // Check target column task limit
      const limitCheck = checkColumnTaskLimit(data.column_id);
      if (!limitCheck.allowed) {
        return sendError(res, 400, {
          code: "COLUMN_TASK_LIMIT_REACHED",
          message: `Target column has reached its maximum limit of ${limitCheck.max_tasks} tasks`,
        });
      }
    }

    // Check for duplicate title if title is changing
    if (data.title && data.title !== task.title) {
      if (checkDuplicateTitle(targetColumnId, data.title, taskId)) {
        return sendError(res, 400, {
          code: "DUPLICATE_TITLE",
          message: "A task with this title already exists in the target column",
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
    if (data.status !== undefined) {
      updates.push("status = ?");
      values.push(data.status);
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
    if (data.due_date !== undefined) {
      updates.push("due_date = ?");
      values.push(data.due_date);
    }
    if (data.labels !== undefined) {
      updates.push("labels = ?");
      values.push(data.labels);
    }

    if (updates.length > 0) {
      updates.push("updated_at = ?");
      values.push(now);
      values.push(taskId);

      db.prepare(`UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    }

    // Get board_id for activity logging
    const column = db.prepare("SELECT board_id, name FROM columns WHERE id = ?").get(task.column_id) as { board_id: string; name: string };
    
    // Log appropriate activity with rich metadata
    if (data.column_id && data.column_id !== task.column_id) {
      const targetCol = db.prepare("SELECT name FROM columns WHERE id = ?").get(data.column_id) as { name: string };
      logActivity(
        column.board_id, 
        userId, 
        "moved", 
        "task", 
        task.title, 
        taskId, 
        `Moved from "${column.name}" → "${targetCol.name}"`,
        { from_column: column.name, to_column: targetCol.name, from_column_id: task.column_id, to_column_id: data.column_id }
      );
    } else if (data.status === "completed" && task.status !== "completed") {
      logActivity(column.board_id, userId, "completed", "task", task.title, taskId, null, { previous_status: task.status });
      
      // Notify task creator if different from current user
      if (task.created_by !== userId) {
        const user = db.prepare("SELECT name FROM users WHERE id = ?").get(userId) as { name: string };
        createNotification(
          task.created_by,
          "task_completed",
          "Task Completed",
          `${user.name} completed "${task.title}"`,
          `/boards/${column.board_id}`
        );
      }
    } else if (data.assignee_id !== undefined && data.assignee_id !== task.assignee_id) {
      const newAssignee = data.assignee_id 
        ? db.prepare("SELECT name FROM users WHERE id = ?").get(data.assignee_id) as { name: string } | undefined
        : null;
      const oldAssignee = task.assignee_id 
        ? db.prepare("SELECT name FROM users WHERE id = ?").get(task.assignee_id) as { name: string } | undefined
        : null;
      logActivity(
        column.board_id, 
        userId, 
        "assigned", 
        "task", 
        task.title, 
        taskId, 
        newAssignee ? `Assigned to ${newAssignee.name}` : "Unassigned",
        { new_assignee: newAssignee?.name || null, old_assignee: oldAssignee?.name || null }
      );
    } else if (data.title !== undefined && data.title !== task.title) {
      logActivity(column.board_id, userId, "updated", "task", data.title, taskId, `Title changed from "${task.title}"`, { old_title: task.title, new_title: data.title });
    } else {
      logActivity(column.board_id, userId, "updated", "task", task.title, taskId);
    }

    // Notify if task assignment changed
    if (data.assignee_id && data.assignee_id !== task.assignee_id && data.assignee_id !== userId) {
      const user = db.prepare("SELECT name FROM users WHERE id = ?").get(userId) as { name: string };
      createNotification(
        data.assignee_id,
        "task_assigned",
        "Task Assigned to You",
        `${user.name} assigned you to "${task.title}"`,
        `/boards/${column.board_id}`
      );
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

    const task = db.prepare("SELECT t.*, c.board_id FROM tasks t JOIN columns c ON t.column_id = c.id WHERE t.id = ?").get(taskId) as (Task & { board_id: string }) | undefined;

    if (!task) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    // Log activity before deletion
    logActivity(task.board_id, userId, "deleted", "task", task.title, null);

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
