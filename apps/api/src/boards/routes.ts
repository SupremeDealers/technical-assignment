import { Router } from "express";
import { getDb } from "../db/index";
import { sendError } from "../errors";
import { authenticate } from "../auth/middleware";
import { createColumnSchema, updateColumnSchema } from "./schemas";
import { ZodError } from "zod";

const router = Router();

// All board/column routes require authentication
router.use(authenticate);

/**
 * DEBUG: GET /boards - List all boards
 */
router.get("/", (req, res) => {
  const db = getDb();
  const boards = db.prepare("SELECT * FROM boards").all();
  res.json({ boards, count: boards.length });
});

/**
 * GET /boards/:boardId
 * Get board details
 */
router.get("/:boardId", (req, res) => {
  try {
    const boardId = parseInt(req.params.boardId);
    
    if (isNaN(boardId)) {
      sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid board ID",
      });
      return;
    }

    const db = getDb();
    const board = db
      .prepare(`
        SELECT b.*, u.name as creator_name, u.email as creator_email
        FROM boards b
        JOIN users u ON b.created_by = u.id
        WHERE b.id = ?
      `)
      .get(boardId) as
      | {
          id: number;
          title: string;
          description: string | null;
          created_by: number;
          created_at: string;
          updated_at: string;
          creator_name: string;
          creator_email: string;
        }
      | undefined;

    if (!board) {
      sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Board not found",
      });
      return;
    }

    res.json({
      id: board.id,
      title: board.title,
      description: board.description,
      createdBy: {
        id: board.created_by,
        name: board.creator_name,
        email: board.creator_email,
      },
      createdAt: board.created_at,
      updatedAt: board.updated_at,
    });
  } catch (error) {
    console.error("[boards] Get board error:", error);
    sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to fetch board",
    });
  }
});

/**
 * GET /boards/:boardId/columns
 * Get all columns for a board with task counts
 */
router.get("/:boardId/columns", (req, res) => {
  try {
    const boardId = parseInt(req.params.boardId);
    
    if (isNaN(boardId)) {
      sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid board ID",
      });
      return;
    }

    const db = getDb();

    // First verify board exists
    const board = db.prepare("SELECT id FROM boards WHERE id = ?").get(boardId);
    if (!board) {
      sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Board not found",
      });
      return;
    }

    // Get columns with task counts
    const columns = db
      .prepare(`
        SELECT 
          c.*,
          COUNT(t.id) as task_count
        FROM columns c
        LEFT JOIN tasks t ON t.column_id = c.id
        WHERE c.board_id = ?
        GROUP BY c.id
        ORDER BY c.position ASC, c.created_at ASC
      `)
      .all(boardId) as Array<{
        id: number;
        board_id: number;
        title: string;
        position: number;
        created_at: string;
        updated_at: string;
        task_count: number;
      }>;

    res.json({
      columns: columns.map((col) => ({
        id: col.id,
        boardId: col.board_id,
        title: col.title,
        position: col.position,
        taskCount: col.task_count,
        createdAt: col.created_at,
        updatedAt: col.updated_at,
      })),
    });
  } catch (error) {
    console.error("[boards] Get columns error:", error);
    sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to fetch columns",
    });
  }
});

/**
 * POST /boards/:boardId/columns
 * Create a new column in a board
 */
router.post("/:boardId/columns", (req, res) => {
  try {
    const boardId = parseInt(req.params.boardId);
    
    if (isNaN(boardId)) {
      sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid board ID",
      });
      return;
    }

    // Validate request body
    const data = createColumnSchema.parse(req.body);

    const db = getDb();

    // Verify board exists
    const board = db.prepare("SELECT id FROM boards WHERE id = ?").get(boardId);
    if (!board) {
      sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Board not found",
      });
      return;
    }

    // If position not provided, add to end
    let position = data.position;
    if (position === undefined) {
      const maxPos = db
        .prepare("SELECT MAX(position) as max FROM columns WHERE board_id = ?")
        .get(boardId) as { max: number | null };
      position = (maxPos.max ?? -1) + 1;
    }

    // Insert column
    const result = db
      .prepare(
        `INSERT INTO columns (board_id, title, position) VALUES (?, ?, ?)`
      )
      .run(boardId, data.title, position);

    const columnId = result.lastInsertRowid as number;

    // Fetch the created column
    const column = db
      .prepare("SELECT * FROM columns WHERE id = ?")
      .get(columnId) as {
        id: number;
        board_id: number;
        title: string;
        position: number;
        created_at: string;
        updated_at: string;
      };

    res.status(201).json({
      id: column.id,
      boardId: column.board_id,
      title: column.title,
      position: column.position,
      taskCount: 0,
      createdAt: column.created_at,
      updatedAt: column.updated_at,
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

    console.error("[boards] Create column error:", error);
    sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to create column",
    });
  }
});

export default router;
