import express from "express";
import { authMiddleware } from "../auth/middleware";
import { sendError } from "../errors";

const router = express.Router();

// Temporary in-memory storage
interface Board {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

interface Column {
  id: number;
  name: string;
  boardId: number;
  position: number;
  createdAt: string;
}

let boards: Board[] = [
  {
    id: 1,
    name: "Sample Board",
    description: "This is a sample board for testing",
    createdAt: new Date().toISOString(),
  },
];

let columns: Column[] = [
  {
    id: 1,
    name: "To Do",
    boardId: 1,
    position: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "In Progress",
    boardId: 1,
    position: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Done",
    boardId: 1,
    position: 2,
    createdAt: new Date().toISOString(),
  },
];

let nextBoardId = 2;
let nextColumnId = 4;

export { boards, columns };

router.get("/:boardId", authMiddleware, (req, res) => {
  const boardId = parseInt(req.params.boardId);
  const board = boards.find((b) => b.id === boardId);

  if (!board) {
    return sendError(res, 404, {
      code: "NOT_FOUND",
      message: "Board not found",
    });
  }

  res.json(board);
});

router.get("/:boardId/columns", authMiddleware, (req, res) => {
  const boardId = parseInt(req.params.boardId);
  const boardColumns = columns.filter((c) => c.boardId === boardId);

  res.json(boardColumns);
});

router.post("/:boardId/columns", authMiddleware, (req, res) => {
  const boardId = parseInt(req.params.boardId);
  const { name } = req.body;

  if (!name || name.trim() === "") {
    return sendError(res, 400, {
      code: "BAD_REQUEST",
      message: "Column name is required",
    });
  }

  const column: Column = {
    id: nextColumnId++,
    name: name.trim(),
    boardId,
    position: columns.filter((c) => c.boardId === boardId).length,
    createdAt: new Date().toISOString(),
  };

  columns.push(column);
  res.json(column);
});

export default router;
