import { Router, type Response } from "express";
import { db } from "../db/db";
import { sendError } from "../errors";
import { type AuthRequest, authenticate } from "../auth";
import { createBoardSchema } from "../validation";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all boards for the authenticated user
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const boards = db
      .prepare("SELECT * FROM boards WHERE owner_id = ? ORDER BY created_at DESC")
      .all(req.userId);

    res.json(boards);
  } catch (error) {
    console.error("[boards] Error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to fetch boards",
    });
  }
});

// Get a specific board
router.get("/:boardId", async (req: AuthRequest, res: Response) => {
  try {
    const board = db
      .prepare("SELECT * FROM boards WHERE id = ? AND owner_id = ?")
      .get(req.params.boardId, req.userId);

    if (!board) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Board not found",
      });
    }

    res.json(board);
  } catch (error) {
    console.error("[boards/:boardId] Error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to fetch board",
    });
  }
});

// Create a new board
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const result = createBoardSchema.safeParse(req.body);

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

    const { name, description } = result.data;

    const stmt = db.prepare(
      "INSERT INTO boards (name, description, owner_id) VALUES (?, ?, ?)"
    );
    const info = stmt.run(name, description || null, req.userId);

    const board = db
      .prepare("SELECT * FROM boards WHERE id = ?")
      .get(info.lastInsertRowid);

    res.status(201).json(board);
  } catch (error) {
    console.error("[boards] Error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to create board",
    });
  }
});

// Get columns for a board with task count
router.get("/:boardId/columns", async (req: AuthRequest, res: Response) => {
  try {
    const columns = db
      .prepare(`
        SELECT 
          c.*,
          COUNT(t.id) as task_count
        FROM columns c
        LEFT JOIN tasks t ON c.id = t.column_id
        WHERE c.board_id = ?
        GROUP BY c.id
        ORDER BY c.position
      `)
      .all(req.params.boardId);

    res.json(columns);
  } catch (error) {
    console.error("[boards/:boardId/columns] Error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to fetch columns",
    });
  }
});

// Create a column in a board
router.post("/:boardId/columns", async (req: AuthRequest, res: Response) => {
  try {
    const result = createBoardSchema.safeParse(req.body);

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

    const { name } = result.data;
    const boardId = req.params.boardId;

    // Get the highest position
    const maxPos = db
      .prepare("SELECT MAX(position) as max FROM columns WHERE board_id = ?")
      .get(boardId) as { max: number | null };

    const position = (maxPos.max ?? -1) + 1;

    const stmt = db.prepare(
      "INSERT INTO columns (board_id, name, position) VALUES (?, ?, ?)"
    );
    const info = stmt.run(boardId, name, position);

    const column = db
      .prepare("SELECT * FROM columns WHERE id = ?")
      .get(info.lastInsertRowid);

    res.status(201).json(column);
  } catch (error) {
    console.error("[boards/:boardId/columns] Error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to create column",
    });
  }
});

export default router;
