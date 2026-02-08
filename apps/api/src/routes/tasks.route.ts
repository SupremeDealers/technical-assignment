import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { sendError } from "../errors";

const router = Router();

router.use(requireAuth);

router.get("/columns/:columnId/tasks", async (req: AuthRequest, res) => {
  try {
    const { columnId } = req.params;
    const { search, page = "1", limit = "20", sort = "createdAt" } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { columnId };
    if (search) {
      where.title = {
        contains: search as string,
        mode: "insensitive",
      };
    }

    const orderBy: any = {};
    if (sort === "createdAt" || sort === "title") {
      orderBy[sort] = "asc";
    } else {
      orderBy.createdAt = "asc";
    }

    const [tasks, total] = await Promise.all([
      db.task.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          _count: {
            select: { comments: true },
          },
        },
      }),
      db.task.count({ where }),
    ]);

    res.json({
      tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    return sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to fetch tasks",
    });
  }
});

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

router.post("/columns/:columnId/tasks", async (req: AuthRequest, res) => {
  try {
    const { columnId } = req.params;
    const validation = createTaskSchema.safeParse(req.body);

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

    const { title } = validation.data;

    const column = await db.column.findUnique({ where: { id: columnId } });
    if (!column) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Column not found",
      });
    }

    const task = await db.task.create({
      data: {
        title,
        columnId,
      },
      include: {
        _count: {
          select: { comments: true },
        },
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error);
    return sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to create task",
    });
  }
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  columnId: z.string().optional(),
});

router.patch("/tasks/:taskId", async (req: AuthRequest, res) => {
  try {
    const { taskId } = req.params;
    const validation = updateTaskSchema.safeParse(req.body);

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

    const data = validation.data;

    const existing = await db.task.findUnique({ where: { id: taskId } });
    if (!existing) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    if (data.columnId) {
      const column = await db.column.findUnique({
        where: { id: data.columnId },
      });
      if (!column) {
        return sendError(res, 404, {
          code: "NOT_FOUND",
          message: "Target column not found",
        });
      }
    }

    const task = await db.task.update({
      where: { id: taskId },
      data,
      include: {
        _count: {
          select: { comments: true },
        },
      },
    });

    res.json(task);
  } catch (error) {
    console.error("Update task error:", error);
    return sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to update task",
    });
  }
});

router.delete("/tasks/:taskId", async (req: AuthRequest, res) => {
  try {
    const { taskId } = req.params;

    const existing = await db.task.findUnique({ where: { id: taskId } });
    if (!existing) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    await db.task.delete({ where: { id: taskId } });

    res.status(204).send();
  } catch (error) {
    console.error("Delete task error:", error);
    return sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to delete task",
    });
  }
});

router.get("/tasks/:taskId", async (req: AuthRequest, res) => {
  try {
    const { taskId } = req.params;

    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        column: true,
        _count: {
          select: { comments: true },
        },
      },
    });

    if (!task) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    res.json(task);
  } catch (error) {
    console.error("Get task error:", error);
    return sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to fetch task",
    });
  }
});

export default router;
