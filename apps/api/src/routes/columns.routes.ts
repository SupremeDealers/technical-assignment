import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { sendError } from "../errors";

const router = Router();

router.use(requireAuth);

const updateColumnSchema = z.object({
  title: z.string().min(1).optional(),
  order: z.number().int().min(0).optional(),
});

router.patch("/:columnId", async (req: AuthRequest, res) => {
  try {
    const { columnId } = req.params;
    const validation = updateColumnSchema.safeParse(req.body);

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

    const existing = await db.column.findUnique({ where: { id: columnId } });
    if (!existing) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Column not found",
      });
    }

    const column = await db.column.update({
      where: { id: columnId },
      data,
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    res.json(column);
  } catch (error) {
    console.error("Update column error:", error);
    return sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to update column",
    });
  }
});

router.delete("/:columnId", async (req: AuthRequest, res) => {
  try {
    const { columnId } = req.params;

    const existing = await db.column.findUnique({
      where: { id: columnId },
      include: { _count: { select: { tasks: true } } },
    });

    if (!existing) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Column not found",
      });
    }

    if (existing._count.tasks > 0) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Cannot delete column with tasks",
      });
    }

    await db.column.delete({ where: { id: columnId } });

    res.status(204).send();
  } catch (error) {
    console.error("Delete column error:", error);
    return sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to delete column",
    });
  }
});

export default router;
