import { Router } from "express";
import { db } from "../db";
import { boards, columns, tasks } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import { createColumnSchema } from "../validation/schemas";
import { sendError } from "../errors";
import { eq, sql } from "drizzle-orm";

const router = Router();
router.use(authMiddleware);

router.get("/:boardId", async (req, res) => {
  try {
    const boardId = parseInt(req.params.boardId);
    const board = await db.query.boards.findFirst({
      where: eq(boards.id, boardId),
    });

    if (!board) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Board not found",
      });
    }

    res.json(board);
  } catch {
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "Internal server error",
    });
  }
});

router.get("/:boardId/columns", async (req, res) => {
  try {
    const boardId = parseInt(req.params.boardId);

    const columnsWithCount = await db
      .select({
        id: columns.id,
        boardId: columns.boardId,
        name: columns.name,
        position: columns.position,
        createdAt: columns.createdAt,
        taskCount: sql<number>`count(${tasks.id})`.as("taskCount"),
      })
      .from(columns)
      .leftJoin(tasks, eq(tasks.columnId, columns.id))
      .where(eq(columns.boardId, boardId))
      .groupBy(columns.id)
      .orderBy(columns.position);

    res.json(columnsWithCount);
  } catch {
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "Internal server error",
    });
  }
});

router.post("/:boardId/columns", async (req, res) => {
  try {
    const boardId = parseInt(req.params.boardId);
    const validatedData = createColumnSchema.parse(req.body);

    const board = await db.query.boards.findFirst({
      where: eq(boards.id, boardId),
    });

    if (!board) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Board not found",
      });
    }

    const [column] = await db
      .insert(columns)
      .values({
        boardId,
        ...validatedData,
      })
      .returning();

    res.status(201).json(column);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid payload",
        details: error.errors,
      });
    }
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "Internal server error",
    });
  }
});

export default router;
