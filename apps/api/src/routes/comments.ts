import { Request, Response, Router } from "express";
import { AuthRequest, requireAuth } from "../middleware/requireAuth";
import { prisma } from "../db/prisma";
import { sendError } from "../errors";
import { createCommentSchema } from "../schemas/comments.schema";

const router = Router();

router.get(
  "/tasks/:taskId/comments",
  requireAuth,
  async (req: Request, res: Response) => {
    const { taskId } = req.params;

    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Number(req.query.limit || 20));

    const skip = (page - 1) * limit;

    const where = { taskId };

    const [items, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true } },
        },
      }),

      prisma.comment.count({ where }),
    ]);

    res.json({
      data: items,
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
  "/tasks/:taskId/comments",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const parsed = createCommentSchema.safeParse(req.body);

    if (!parsed.success) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid input",
      });
    }

    const { taskId } = req.params;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    const comment = await prisma.comment.create({
      data: {
        body: parsed.data.body,
        taskId,
        authorId: req.user!.id,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(comment);
  },
);

export default router;
