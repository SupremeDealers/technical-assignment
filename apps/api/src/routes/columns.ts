import express from "express";
import { authMiddleware } from "../auth/middleware";
import { sendError } from "../errors";
import { columns as boardColumns } from "./boards";

const router = express.Router();

// Temporary in-memory storage
interface Column {
  id: number;
  name: string;
  boardId: number;
  position: number;
  createdAt: string;
}

// Re-export columns from boards to maintain consistency
export const columns = boardColumns;

router.patch("/:columnId", authMiddleware, (req, res) => {
  const columnId = parseInt(req.params.columnId);
  const { name, position } = req.body;

  const columnIndex = columns.findIndex((c) => c.id === columnId);
  if (columnIndex === -1) {
    return sendError(res, 404, {
      code: "NOT_FOUND",
      message: "Column not found",
    });
  }

  if (name !== undefined) {
    if (!name || name.trim() === "") {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Column name cannot be empty",
      });
    }
    columns[columnIndex].name = name.trim();
  }

  if (position !== undefined) {
    if (typeof position !== "number" || position < 0) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Position must be a non-negative number",
      });
    }
    columns[columnIndex].position = position;
  }

  res.json(columns[columnIndex]);
});

router.delete("/:columnId", authMiddleware, (req, res) => {
  const columnId = parseInt(req.params.columnId);
  const columnIndex = columns.findIndex((c) => c.id === columnId);

  if (columnIndex === -1) {
    return sendError(res, 404, {
      code: "NOT_FOUND",
      message: "Column not found",
    });
  }

  const deletedColumn = columns.splice(columnIndex, 1)[0];
  res.json(deletedColumn);
});

export default router;
