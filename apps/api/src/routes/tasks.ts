import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { parseOrError } from "../validate";
import { sendError } from "../errors";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { findColumn, findTask } from "../queries";

const router = Router();

const listSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  sort: z.enum(["createdAt", "priority"]).optional(),
});

router.get("/columns/:columnId/tasks", requireAuth, async (req, res) => {
  const query = parseOrError(res, listSchema, req.query);
  if (!query) return;
  const { columnId } = req.params;
  const userId = (req as AuthedRequest).userId;
  const column = await findColumn(prisma, columnId, userId);
  if (!column) {
    return sendError(res, 404, {
      code: "NOT_FOUND",
      message: "Column not found",
    });
  }

  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const search = query.search?.trim();
  const sort = query.sort ?? "createdAt";

  const where = {
    columnId,
    ...(search
      ? {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
          ],
        }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      orderBy:
        sort === "priority" ? { priority: "desc" } : { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return res.json({
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.coerce.number().int().min(0).max(5).optional(),
});

router.post("/columns/:columnId/tasks", requireAuth, async (req, res) => {
  const body = parseOrError(res, createSchema, req.body);
  if (!body) return;
  const { columnId } = req.params;
  const userId = (req as AuthedRequest).userId;
  const column = await findColumn(prisma, columnId, userId);
  if (!column) {
    return sendError(res, 404, {
      code: "NOT_FOUND",
      message: "Column not found",
    });
  }

  const task = await prisma.task.create({
    data: {
      title: body.title,
      description: body.description,
      priority: body.priority ?? 1,
      columnId,
      boardId: column.boardId,
    },
  });

  return res.status(201).json(task);
});

const patchSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    priority: z.coerce.number().int().min(0).max(5).optional(),
    columnId: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field",
  });

router.patch("/tasks/:taskId", requireAuth, async (req, res) => {
  const body = parseOrError(res, patchSchema, req.body);
  if (!body) return;
  const { taskId } = req.params;
  const userId = (req as AuthedRequest).userId;
  const task = await findTask(prisma, taskId, userId);
  if (!task) {
    return sendError(res, 404, {
      code: "NOT_FOUND",
      message: "Task not found",
    });
  }

  if (body.columnId) {
    const target = await prisma.column.findFirst({
      where: { id: body.columnId, boardId: task.boardId },
    });
    if (!target) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid target column",
      });
    }
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: body,
  });
  return res.json(updated);
});

router.delete("/tasks/:taskId", requireAuth, async (req, res) => {
  const { taskId } = req.params;
  const userId = (req as AuthedRequest).userId;
  const task = await findTask(prisma, taskId, userId);
  if (!task) {
    return sendError(res, 404, {
      code: "NOT_FOUND",
      message: "Task not found",
    });
  }
  await prisma.task.delete({ where: { id: taskId } });
  return res.json({ ok: true });
});

export default router;
