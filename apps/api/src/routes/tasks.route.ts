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
      };
    }

    const allTasks = await db.task.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            email: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    const sortParam = (sort as string) || "createdAt_desc";

    const priorityOrder: Record<string, number> = {
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    allTasks.sort((a, b) => {
      const pA = priorityOrder[(a as any).priority] || 0;
      const pB = priorityOrder[(b as any).priority] || 0;
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();

      if (sortParam === "priority_desc" || sortParam === "priority") {
        if (pA !== pB) return pB - pA; // High > Low
        return timeB - timeA; // then recent
      }
      if (sortParam === "priority_asc") {
        if (pA !== pB) return pA - pB; // Low > High
        return timeB - timeA;
      }
      if (sortParam === "createdAt_asc") {
        return timeA - timeB; // Oldest first
      }
      // Default: createdAt_desc
      return timeB - timeA; // Newest first
    });

    const total = allTasks.length;
    const tasks = allTasks.slice(skip, skip + limitNum);

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
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  userId: z.string().nullable().optional(),
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

    const { title, description, priority, userId } = validation.data;

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
        description,
        priority: priority ?? "MEDIUM",
        columnId,
        userId,
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
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  columnId: z.string().optional(),
  userId: z.string().nullable().optional(),
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
