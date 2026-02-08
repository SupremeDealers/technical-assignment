import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { sendError } from "../errors";

const router = Router();

// All board routes require authentication
router.use(requireAuth);

// GET /boards
router.get("/", async (_req: AuthRequest, res) => {
  try {
    const boards = await db.board.findMany();
    res.json(boards);
  } catch (error) {
    console.error("Get boards error:", error);
    return sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to fetch boards",
    });
  }
});

// GET /boards/:boardId
router.get("/:boardId", async (req: AuthRequest, res) => {
  try {
    const { boardId } = req.params;

    const board = await db.board.findUnique({
      where: { id: boardId },
      include: {
        columns: {
          orderBy: { order: "asc" },
          include: {
            _count: {
              select: { tasks: true },
            },
          },
        },
      },
    });

    if (!board) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Board not found",
      });
    }

    res.json(board);
  } catch (error) {
    console.error("Get board error:", error);
    return sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to fetch board",
    });
  }
});

// GET /boards/:boardId/columns
router.get("/:boardId/columns", async (req: AuthRequest, res) => {
  try {
    const { boardId } = req.params;

    const columns = await db.column.findMany({
      where: { boardId },
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    res.json(columns);
  } catch (error) {
    console.error("Get columns error:", error);
    return sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to fetch columns",
    });
  }
});

const createColumnSchema = z.object({
  title: z.string().min(1, "Title is required"),
  order: z.number().int().min(0),
});

// POST /boards/:boardId/columns
router.post("/:boardId/columns", async (req: AuthRequest, res) => {
  try {
    const { boardId } = req.params;
    const validation = createColumnSchema.safeParse(req.body);

    if (!validation.success) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid payload",
        details: validation.error.issues.map((e: any) => ({
          path: e.path.join("."),
          issue: e.message,
        })),
      });
    }

    const { title, order } = validation.data;

    // Verify board exists
    const board = await db.board.findUnique({ where: { id: boardId } });
    if (!board) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Board not found",
      });
    }

    const column = await db.column.create({
      data: {
        title,
        order,
        boardId,
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    res.status(201).json(column);
  } catch (error) {
    console.error("Create column error:", error);
    return sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to create column",
    });
  }
});

export default router;
