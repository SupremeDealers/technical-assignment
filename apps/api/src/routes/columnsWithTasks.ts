import { Router, type Response } from "express";
import { db } from "../db/db";
import { sendError } from "../errors";
import { type AuthRequest, authenticate } from "../auth";
import { createTaskSchema, taskQuerySchema } from "../validation";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get tasks for a column with pagination and search
router.get("/:columnId/tasks", async (req: AuthRequest, res: Response) => {
  try {
    const queryResult = taskQuerySchema.safeParse(req.query);

    if (!queryResult.success) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid query parameters",
        details: queryResult.error.issues.map((e) => ({
          path: e.path.join("."),
          issue: e.message,
        })),
      });
    }

    const {
      search,
      page = 1,
      limit = 20,
      sort = "createdAt",
    } = queryResult.data;

    const columnId = req.params.columnId;
    const offset = (page - 1) * limit;

    let query =
      "SELECT t.* FROM tasks t " +
      "JOIN columns c ON t.column_id = c.id " +
      "JOIN boards b ON c.board_id = b.id " +
      "WHERE t.column_id = ? AND b.user_id = ?";
    const params: (string | number)[] = [columnId, req.userId as string | number];

    if (search) {
      query += " AND (t.title LIKE ? OR t.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    // Add sorting
    const sortMap: Record<string, string> = {
      createdAt: "t.created_at DESC",
      priority:
        "CASE t.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END",
      title: "t.title ASC",
    };

    query += ` ORDER BY ${sortMap[sort]}, t.position`;
    query += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const tasks = db.prepare(query).all(...params);

    // Get total count for pagination
    let countQuery =
      "SELECT COUNT(*) as count FROM tasks t " +
      "JOIN columns c ON t.column_id = c.id " +
      "JOIN boards b ON c.board_id = b.id " +
      "WHERE t.column_id = ? AND b.user_id = ?";
    const countParams: (string | number)[] = [columnId, req.userId as string | number];

    if (search) {
      countQuery += " AND (t.title LIKE ? OR t.description LIKE ?)";
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const { count } = db.prepare(countQuery).get(...countParams) as {
      count: number;
    };

    res.json({
      tasks,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("[columns/:columnId/tasks] Error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to fetch tasks",
    });
  }
});

// Create a task in a column
router.post("/:columnId/tasks", async (req: AuthRequest, res: Response) => {
  try {
    const result = createTaskSchema.safeParse(req.body);

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

    const { title, description, priority } = result.data;
    const columnId = req.params.columnId;

    // Get the highest position in this column
    const maxPos = db
      .prepare("SELECT MAX(position) as max FROM tasks WHERE column_id = ?")
      .get(columnId) as { max: number | null };

    const position = (maxPos.max ?? -1) + 1;

    const stmt = db.prepare(
      "INSERT INTO tasks (column_id, title, description, priority, position) VALUES (?, ?, ?, ?, ?)"
    );
    const info = stmt.run(
      columnId,
      title,
      description || null,
      priority || "medium",
      position
    );

    const task = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(info.lastInsertRowid);

    res.status(201).json(task);
  } catch (error) {
    console.error("[columns/:columnId/tasks] Error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to create task",
    });
  }
});

export default router;
