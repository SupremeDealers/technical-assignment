import { Router } from "express";
import { getDb } from "../db/index";
import { sendError } from "../errors";
import { authenticate } from "../auth/middleware";
import { createTaskSchema, updateTaskSchema } from "./schemas";
import { ZodError } from "zod";

const router = Router();

// All task routes require authentication
router.use(authenticate);

/**
 * GET /columns/:columnId/tasks
 * Get all tasks for a column with pagination, search, and sorting
 * Query params: 
 *   - search: string (search in title/description)
 *   - page: number (default 1)
 *   - limit: number (default 20, max 100)
 *   - sort: 'createdAt' | 'priority' (default 'createdAt')
 */
router.get("/:columnId/tasks", (req, res) => {
  try {
    const columnId = parseInt(req.params.columnId);
    
    if (isNaN(columnId)) {
      sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid column ID",
      });
      return;
    }

    const db = getDb();

    // Verify column exists
    const column = db
      .prepare("SELECT id FROM columns WHERE id = ?")
      .get(columnId);

    if (!column) {
      sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Column not found",
      });
      return;
    }

    // Parse query params
    const search = (req.query.search as string) || "";
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const sort = (req.query.sort as string) === "priority" ? "priority" : "createdAt";
    const offset = (page - 1) * limit;

    // Build query
    let query = `
      SELECT 
        t.*,
        u1.name as creator_name,
        u1.email as creator_email,
        u2.name as assignee_name,
        u2.email as assignee_email
      FROM tasks t
      JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      WHERE t.column_id = ?
    `;

    const params: any[] = [columnId];

    // Add search filter
    if (search) {
      query += ` AND (t.title LIKE ? OR t.description LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    // Add sorting
    if (sort === "priority") {
      // Sort by priority: high > medium > low
      query += ` ORDER BY 
        CASE t.priority 
          WHEN 'high' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 3 
        END,
        t.created_at DESC
      `;
    } else {
      query += ` ORDER BY t.created_at DESC`;
    }

    // Add pagination
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Get tasks
    const tasks = db.prepare(query).all(...params) as Array<{
      id: number;
      column_id: number;
      title: string;
      description: string | null;
      priority: string;
      created_by: number;
      assigned_to: number | null;
      created_at: string;
      updated_at: string;
      creator_name: string;
      creator_email: string;
      assignee_name: string | null;
      assignee_email: string | null;
    }>;

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM tasks WHERE column_id = ?`;
    const countParams: any[] = [columnId];

    if (search) {
      countQuery += ` AND (title LIKE ? OR description LIKE ?)`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern);
    }

    const { total } = db.prepare(countQuery).get(...countParams) as { total: number };

    res.json({
      tasks: tasks.map((task) => ({
        id: task.id,
        columnId: task.column_id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        createdBy: {
          id: task.created_by,
          name: task.creator_name,
          email: task.creator_email,
        },
        assignedTo: task.assigned_to
          ? {
              id: task.assigned_to,
              name: task.assignee_name!,
              email: task.assignee_email!,
            }
          : null,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[tasks] Get tasks error:", error);
    sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to fetch tasks",
    });
  }
});

/**
 * POST /columns/:columnId/tasks
 * Create a new task in a column
 */
router.post("/:columnId/tasks", (req, res) => {
  try {
    const columnId = parseInt(req.params.columnId);
    
    if (isNaN(columnId)) {
      sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid column ID",
      });
      return;
    }

    // Validate request body
    const data = createTaskSchema.parse(req.body);

    const db = getDb();

    // Verify column exists
    const column = db
      .prepare("SELECT id FROM columns WHERE id = ?")
      .get(columnId);

    if (!column) {
      sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Column not found",
      });
      return;
    }

    // If assignedTo is provided, verify user exists
    if (data.assignedTo) {
      const user = db
        .prepare("SELECT id FROM users WHERE id = ?")
        .get(data.assignedTo);

      if (!user) {
        sendError(res, 400, {
          code: "BAD_REQUEST",
          message: "Assigned user not found",
        });
        return;
      }
    }

    // Insert task
    const result = db
      .prepare(
        `INSERT INTO tasks (column_id, title, description, priority, created_by, assigned_to) 
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        columnId,
        data.title,
        data.description || null,
        data.priority,
        req.user!.userId,
        data.assignedTo || null
      );

    const taskId = result.lastInsertRowid as number;

    // Fetch the created task with user info
    const task = db
      .prepare(
        `
        SELECT 
          t.*,
          u1.name as creator_name,
          u1.email as creator_email,
          u2.name as assignee_name,
          u2.email as assignee_email
        FROM tasks t
        JOIN users u1 ON t.created_by = u1.id
        LEFT JOIN users u2 ON t.assigned_to = u2.id
        WHERE t.id = ?
      `
      )
      .get(taskId) as {
        id: number;
        column_id: number;
        title: string;
        description: string | null;
        priority: string;
        created_by: number;
        assigned_to: number | null;
        created_at: string;
        updated_at: string;
        creator_name: string;
        creator_email: string;
        assignee_name: string | null;
        assignee_email: string | null;
      };

    res.status(201).json({
      id: task.id,
      columnId: task.column_id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      createdBy: {
        id: task.created_by,
        name: task.creator_name,
        email: task.creator_email,
      },
      assignedTo: task.assigned_to
        ? {
            id: task.assigned_to,
            name: task.assignee_name!,
            email: task.assignee_email!,
          }
        : null,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
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

    console.error("[tasks] Create task error:", error);
    sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to create task",
    });
  }
});

export default router;
