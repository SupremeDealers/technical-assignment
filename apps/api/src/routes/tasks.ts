import { Router } from "express";
import { db } from "../db";
import { tasks, users, columns } from "../db/schema";
import { authMiddleware, type AuthRequest } from "../middleware/auth";
import { createTaskSchema, updateTaskSchema, paginationSchema } from "../validation/schemas";
import { sendError } from "../errors";
import { eq, like, or, sql, desc, asc } from "drizzle-orm";

const router = Router();
router.use(authMiddleware);

router.get("/:columnId/tasks", async (req, res) => {
  try {
    const columnId = parseInt(req.params.columnId);
    const { page, limit, search, sort } = paginationSchema.parse(req.query);

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let query = db
      .select({
        id: tasks.id,
        columnId: tasks.columnId,
        title: tasks.title,
        description: tasks.description,
        priority: tasks.priority,
        position: tasks.position,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        createdBy: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.createdById, users.id))
      .where(eq(tasks.columnId, columnId))
      .$dynamic();

    if (search) {
      query = query.where(
        or(
          like(tasks.title, `%${search}%`),
          like(tasks.description, `%${search}%`)
        )
      );
    }

    const orderBy = sort === "priority" ? tasks.priority : tasks.createdAt;
    const tasksResult = await query
      .orderBy(desc(orderBy))
      .limit(limitNum)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(eq(tasks.columnId, columnId));

    res.json({
      tasks: tasksResult,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid query parameters",
        details: error.errors,
      });
    }
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "Internal server error",
    });
  }
});

router.post("/:columnId/tasks", async (req: AuthRequest, res) => {
  try {
    const columnId = parseInt(req.params.columnId);
    const validatedData = createTaskSchema.parse(req.body);

    const column = await db.query.columns.findFirst({
      where: eq(columns.id, columnId),
    });

    if (!column) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Column not found",
      });
    }

    const [task] = await db
      .insert(tasks)
      .values({
        columnId,
        createdById: req.userId!,
        ...validatedData,
      })
      .returning();

    res.status(201).json(task);
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

router.patch("/:taskId", async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const validatedData = updateTaskSchema.parse(req.body);

    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!task) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    if (validatedData.columnId) {
      const column = await db.query.columns.findFirst({
        where: eq(columns.id, validatedData.columnId),
      });

      if (!column) {
        return sendError(res, 404, {
          code: "NOT_FOUND",
          message: "Target column not found",
        });
      }
    }

    const [updated] = await db
      .update(tasks)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();

    res.json(updated);
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

router.delete("/:taskId", async (req, res) => {
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

    await db.delete(tasks).where(eq(tasks.id, taskId));

    res.status(204).send();
  } catch {
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "Internal server error",
    });
  }
});

export default router;
