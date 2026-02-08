import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { sendError } from "../errors";

const router = Router();

router.use(requireAuth);

router.get("/tasks/:taskId/comments", async (req: AuthRequest, res) => {
  try {
    const { taskId } = req.params;

    const task = await db.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    const comments = await db.comment.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });

    res.json(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    return sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to fetch comments",
    });
  }
});

const createCommentSchema = z.object({
  content: z.string().min(1, "Content is required"),
});

router.post("/tasks/:taskId/comments", async (req: AuthRequest, res) => {
  try {
    const { taskId } = req.params;
    const validation = createCommentSchema.safeParse(req.body);

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

    const { content } = validation.data;

    const task = await db.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    const comment = await db.comment.create({
      data: {
        content,
        taskId,
        userId: req.user!.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error("Create comment error:", error);
    return sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to create comment",
    });
  }
});

export default router;
