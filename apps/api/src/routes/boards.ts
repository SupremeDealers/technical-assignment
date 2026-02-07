import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { parseOrError } from "../validate";
import { sendError } from "../errors";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { findBoard } from "../queries";

const router = Router();

router.get("/:boardId", requireAuth, async (req, res) => {
  const { boardId } = req.params;
  const userId = (req as AuthedRequest).userId;
  const board = await findBoard(prisma, boardId, userId);
  if (!board) {
    return sendError(res, 404, {
      code: "NOT_FOUND",
      message: "Board not found",
    });
  }
  return res.json(board);
});

router.get("/:boardId/columns", requireAuth, async (req, res) => {
  const { boardId } = req.params;
  const userId = (req as AuthedRequest).userId;
  const board = await findBoard(prisma, boardId, userId);
  if (!board) {
    return sendError(res, 404, {
      code: "NOT_FOUND",
      message: "Board not found",
    });
  }

  const columns = await prisma.column.findMany({
    where: { boardId },
    orderBy: { order: "asc" },
    include: { _count: { select: { tasks: true } } },
  });

  return res.json(
    columns.map((c) => ({
      id: c.id,
      title: c.title,
      order: c.order,
      taskCount: c._count.tasks,
    }))
  );
});

const columnSchema = z.object({
  title: z.string().min(1),
});

router.post("/:boardId/columns", requireAuth, async (req, res) => {
  const body = parseOrError(res, columnSchema, req.body);
  if (!body) return;
  const { boardId } = req.params;
  const userId = (req as AuthedRequest).userId;
  const board = await findBoard(prisma, boardId, userId);
  if (!board) {
    return sendError(res, 404, {
      code: "NOT_FOUND",
      message: "Board not found",
    });
  }

  const last = await prisma.column.findFirst({
    where: { boardId },
    orderBy: { order: "desc" },
  });

  const column = await prisma.column.create({
    data: {
      boardId,
      title: body.title,
      order: (last?.order ?? 0) + 1,
    },
  });

  return res.status(201).json(column);
});

export default router;
