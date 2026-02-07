import { Router } from "express";
import { db } from "../db";
import { comments, tasks, users } from "../db/schema";
import { authMiddleware, type AuthRequest } from "../middleware/auth";
import { createCommentSchema } from "../validation/schemas";
import { sendError } from "../errors";
import { eq, desc } from "drizzle-orm";

const router = Router();
router.use(authMiddleware);

router.get("/:taskId/comments", async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);

    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!task) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    const commentsResult = await db
      .select({
        id: comments.id,
        taskId: comments.taskId,
        content: comments.content,
        createdAt: comments.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.taskId, taskId))
      .orderBy(desc(comments.createdAt));

    res.json(commentsResult);
  } catch {
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "Internal server error",
    });
  }
});

router.post("/:taskId/comments", async (req: AuthRequest, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const validatedData = createCommentSchema.parse(req.body);

    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!task) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    const [comment] = await db
      .insert(comments)
      .values({
        taskId,
        userId: req.userId!,
        ...validatedData,
      })
      .returning();

    res.status(201).json(comment);
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
