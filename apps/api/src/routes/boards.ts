import { Router, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import * as z from "zod";
import { createBoardSchema, updateBoardSchema } from "../schemas";
import { sendError } from "../errors";
import db from "../db";
import { authenticate, checkBoardAccess, type AuthRequest } from "../middleware/auth";
import type { Board, BoardWithDetails, ColumnWithTaskCount, UserPublic } from "../types";

const router = Router();

router.use(authenticate);

function formatZodErrors(error: z.ZodError) {
  return error.issues.map((e) => ({
    path: e.path.join("."),
    issue: e.message,
  }));
}

router.get("/", (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const boards = db
      .prepare(
        `
        SELECT DISTINCT b.* FROM boards b
        LEFT JOIN board_members bm ON b.id = bm.board_id
        WHERE b.owner_id = ? OR bm.user_id = ?
        ORDER BY b.created_at DESC
      `
      )
      .all(userId, userId) as Board[];

    res.json({ boards });
  } catch (error) {
    console.error("Get boards error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

router.post("/", (req: AuthRequest, res: Response) => {
  try {
    const data = createBoardSchema.parse(req.body);
    const userId = req.user!.id;

    const boardId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(
      `INSERT INTO boards (id, name, description, owner_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(boardId, data.name, data.description || null, userId, now, now);

    const columns = ["To Do", "In Progress", "Done"];
    columns.forEach((name, index) => {
      const columnId = uuidv4();
      db.prepare(
        `INSERT INTO columns (id, board_id, name, position, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(columnId, boardId, name, index, now, now);
    });

    const board: Board = {
      id: boardId,
      name: data.name,
      description: data.description || null,
      owner_id: userId,
      created_at: now,
      updated_at: now,
    };

    res.status(201).json({ board });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid payload",
        details: formatZodErrors(error),
      });
    }
    console.error("Create board error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

router.get("/:boardId", (req: AuthRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const userId = req.user!.id;

    if (!checkBoardAccess(userId, boardId)) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Board not found",
      });
    }

    const board = db.prepare("SELECT * FROM boards WHERE id = ?").get(boardId) as Board | undefined;

    if (!board) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Board not found",
      });
    }

    const owner = db
      .prepare("SELECT id, email, name, created_at FROM users WHERE id = ?")
      .get(board.owner_id) as UserPublic;

    const columns = db
      .prepare(
        `
        SELECT c.*, 
               (SELECT COUNT(*) FROM tasks t WHERE t.column_id = c.id) as task_count
        FROM columns c
        WHERE c.board_id = ?
        ORDER BY c.position ASC
      `
      )
      .all(boardId) as ColumnWithTaskCount[];

    const response: BoardWithDetails = {
      ...board,
      owner,
      columns,
    };

    res.json({ board: response });
  } catch (error) {
    console.error("Get board error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

router.patch("/:boardId", (req: AuthRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const userId = req.user!.id;
    const data = updateBoardSchema.parse(req.body);

    const board = db.prepare("SELECT * FROM boards WHERE id = ? AND owner_id = ?").get(boardId, userId) as
      | Board
      | undefined;

    if (!board) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Board not found or you don't have permission to edit it",
      });
    }

    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: (string | null)[] = [];

    if (data.name !== undefined) {
      updates.push("name = ?");
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      values.push(data.description || null);
    }

    if (updates.length > 0) {
      updates.push("updated_at = ?");
      values.push(now);
      values.push(boardId);

      db.prepare(`UPDATE boards SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    }

    const updatedBoard = db.prepare("SELECT * FROM boards WHERE id = ?").get(boardId) as Board;

    res.json({ board: updatedBoard });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid payload",
        details: formatZodErrors(error),
      });
    }
    console.error("Update board error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

router.delete("/:boardId", (req: AuthRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const userId = req.user!.id;

    const board = db.prepare("SELECT * FROM boards WHERE id = ? AND owner_id = ?").get(boardId, userId) as
      | Board
      | undefined;

    if (!board) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Board not found or you don't have permission to delete it",
      });
    }

    db.prepare("DELETE FROM boards WHERE id = ?").run(boardId);

    res.status(204).send();
  } catch (error) {
    console.error("Delete board error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

router.get("/:boardId/columns", (req: AuthRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const userId = req.user!.id;

    if (!checkBoardAccess(userId, boardId)) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Board not found",
      });
    }

    const columns = db
      .prepare(
        `
        SELECT c.*, 
               (SELECT COUNT(*) FROM tasks t WHERE t.column_id = c.id) as task_count
        FROM columns c
        WHERE c.board_id = ?
        ORDER BY c.position ASC
      `
      )
      .all(boardId) as ColumnWithTaskCount[];

    res.json({ columns });
  } catch (error) {
    console.error("Get columns error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

router.post("/:boardId/columns", (req: AuthRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const userId = req.user!.id;
    const { createColumnSchema } = require("../schemas");
    const data = createColumnSchema.parse(req.body);

    if (!checkBoardAccess(userId, boardId)) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Board not found",
      });
    }

    let position = data.position;
    if (position === undefined) {
      const maxPos = db
        .prepare("SELECT MAX(position) as max_pos FROM columns WHERE board_id = ?")
        .get(boardId) as { max_pos: number | null };
      position = (maxPos?.max_pos ?? -1) + 1;
    }

    const columnId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(
      `INSERT INTO columns (id, board_id, name, position, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(columnId, boardId, data.name, position, now, now);

    const column = db.prepare("SELECT * FROM columns WHERE id = ?").get(columnId);

    res.status(201).json({ column });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid payload",
        details: formatZodErrors(error),
      });
    }
    console.error("Create column error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

export default router;
