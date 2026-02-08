import { Router, Request, Response } from "express";
import db from "../db.js";
import { authMiddleware } from "../auth.js";
import { validate } from "../middleware.js";
import { createBoardSchema, createColumnSchema } from "../schemas.js";
import { sendError } from "../errors.js";

const router = Router();
router.use(authMiddleware);

// GET /boards - list user's boards
router.get("/", (req: Request, res: Response) => {
  const boards = db
    .prepare("SELECT id, name, owner_id, created_at FROM boards WHERE owner_id = ? ORDER BY created_at DESC")
    .all(req.user!.userId);
  res.json({ boards });
});

// POST /boards - create a board
router.post("/", validate(createBoardSchema), (req: Request, res: Response) => {
  const { name } = req.body;
  const result = db.prepare("INSERT INTO boards (name, owner_id) VALUES (?, ?)").run(name, req.user!.userId);
  const board = db.prepare("SELECT * FROM boards WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ board });
});

// GET /boards/:boardId
router.get("/:boardId", (req: Request, res: Response) => {
  const board = db.prepare("SELECT * FROM boards WHERE id = ?").get(req.params.boardId) as any;
  if (!board) {
    return sendError(res, 404, { code: "NOT_FOUND", message: "Board not found" });
  }
  res.json({ board });
});

// GET /boards/:boardId/columns
router.get("/:boardId/columns", (req: Request, res: Response) => {
  const board = db.prepare("SELECT * FROM boards WHERE id = ?").get(req.params.boardId) as any;
  if (!board) {
    return sendError(res, 404, { code: "NOT_FOUND", message: "Board not found" });
  }

  const columns = db
    .prepare(
      `SELECT c.id, c.board_id, c.name, c.position, c.created_at,
              (SELECT COUNT(*) FROM tasks t WHERE t.column_id = c.id) as task_count
       FROM columns c
       WHERE c.board_id = ?
       ORDER BY c.position ASC`
    )
    .all(req.params.boardId);

  res.json({ columns });
});

// POST /boards/:boardId/columns
router.post("/:boardId/columns", validate(createColumnSchema), (req: Request, res: Response) => {
  const board = db.prepare("SELECT * FROM boards WHERE id = ?").get(req.params.boardId) as any;
  if (!board) {
    return sendError(res, 404, { code: "NOT_FOUND", message: "Board not found" });
  }

  // Get next position
  const maxPos = db
    .prepare("SELECT COALESCE(MAX(position), -1) as maxPos FROM columns WHERE board_id = ?")
    .get(req.params.boardId) as any;

  const result = db
    .prepare("INSERT INTO columns (board_id, name, position) VALUES (?, ?, ?)")
    .run(req.params.boardId, req.body.name, maxPos.maxPos + 1);

  const column = db.prepare("SELECT * FROM columns WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ column });
});

export default router;
