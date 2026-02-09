import { Response, Router } from "express";
import z from "zod";
import { prisma } from "../db/prisma";
import { sendError } from "../errors";
import { AuthRequest, requireAuth } from "../middleware/requireAuth";
import {
  createTaskSchema,
  moveTaskSchema,
  updateTaskSchema,
} from "../schemas/task.schema";
import { getPagination } from "../lib/getPagination";

const router = Router();

router.get(
  "/boards/:boardId/tasks",
  requireAuth,
  async (req: AuthRequest, res) => {
    const { boardId } = req.params;
    const search = String(req.query.search || "");

    const { page, limit, skip } = getPagination(req);

    const where: any = {
      boardId,
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      }),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { column: true },
      }),

      prisma.task.count({ where }),
    ]);

    return res.json({
      tasks,
      meta: {
        page,
        limit,
        total,
        hasNext: page * limit < total,
      },
    });
  },
);

router.post(
  "/boards/:boardId/tasks",
  requireAuth,
  async (req: AuthRequest, res) => {
    const parsed = createTaskSchema.safeParse(req.body);

    if (!parsed.success) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid input",
        details: z.treeifyError(parsed.error),
      });
    }

    const { boardId } = req.params;
    const { title, description, columnId } = parsed.data;

    const column = await prisma.column.findUnique({
      where: { id: columnId },
    });

    if (!column || column.boardId !== boardId) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Column not found",
      });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        boardId,
        columnId,
        authorId: req.user!.id,
      },
      include: { column: true },
    });

    return res.status(201).json(task);
  },
);

router.patch("/tasks/:taskId", requireAuth, async (req: AuthRequest, res) => {
  const parsed = updateTaskSchema.safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, {
      code: "BAD_REQUEST",
      message: "Invalid input",
    });
  }

  const { taskId } = req.params;

  const exists = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!exists) {
    return sendError(res, 404, {
      code: "NOT_FOUND",
      message: "Task not found",
    });
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: parsed.data,
  });

  return res.json(task);
});

router.patch(
  "/tasks/:taskId/move",
  requireAuth,
  async (req: AuthRequest, res) => {
    const parsed = moveTaskSchema.safeParse(req.body);

    if (!parsed.success) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid input",
      });
    }

    const { taskId } = req.params;
    const { columnId, position } = parsed.data;

    const column = await prisma.column.findUnique({
      where: { id: columnId },
    });

    if (!column) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Column not found",
      });
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        columnId,
        ...(position !== undefined && { position }),
      },
      include: { column: true },
    });

    return res.json(task);
  },
);

router.delete(
  "/tasks/:taskId/delete",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const { taskId } = req.params;
    await prisma.task.delete({ where: { id: taskId } });

    return res.json({ message: "Task Deleted Successfully" });
  },
);

export default router;
