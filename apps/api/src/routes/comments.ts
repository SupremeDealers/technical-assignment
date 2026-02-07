import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { parseOrError } from "../validate";
import { sendError } from "../errors";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { findTask } from "../queries";

const router = Router();

router.get("/tasks/:taskId/comments", requireAuth, async (req, res) => {
  const { taskId } = req.params;
  const userId = (req as AuthedRequest).userId;
  const task = await findTask(prisma, taskId, userId);
  if (!task) {
    return sendError(res, 404, {
      code: "NOT_FOUND",
      message: "Task not found",
    });
  }

  const comments = await prisma.comment.findMany({
    where: { taskId },
    include: { author: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
  return res.json(comments);
});

const createSchema = z.object({
  body: z.string().min(1),
});

router.post("/tasks/:taskId/comments", requireAuth, async (req, res) => {
  const body = parseOrError(res, createSchema, req.body);
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

  const comment = await prisma.comment.create({
    data: {
      body: body.body,
      taskId,
      authorId: userId,
    },
    include: { author: { select: { id: true, name: true } } },
  });
  return res.status(201).json(comment);
});

export default router;
