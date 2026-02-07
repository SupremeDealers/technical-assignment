import { Router, Response } from "express";
import * as z from "zod";
import { updateColumnSchema } from "../schemas";
import { sendError } from "../errors";
import db from "../db";
import { authenticate, checkColumnAccess, type AuthRequest } from "../middleware/auth";
import type { Column } from "../types";

const router = Router();

router.use(authenticate);

function formatZodErrors(error: z.ZodError) {
  return error.issues.map((e) => ({
    path: e.path.join("."),
    issue: e.message,
  }));
}

router.patch("/:columnId", (req: AuthRequest, res: Response) => {
  try {
    const { columnId } = req.params;
    const userId = req.user!.id;
    const data = updateColumnSchema.parse(req.body);

    if (!checkColumnAccess(userId, columnId)) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Column not found",
      });
    }

    const column = db.prepare("SELECT * FROM columns WHERE id = ?").get(columnId) as Column | undefined;

    if (!column) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Column not found",
      });
    }

    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (data.name !== undefined) {
      updates.push("name = ?");
      values.push(data.name);
    }
    if (data.position !== undefined) {
      updates.push("position = ?");
      values.push(data.position);
    }

    if (updates.length > 0) {
      updates.push("updated_at = ?");
      values.push(now);
      values.push(columnId);

      db.prepare(`UPDATE columns SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    }

    const updatedColumn = db.prepare("SELECT * FROM columns WHERE id = ?").get(columnId);

    res.json({ column: updatedColumn });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid payload",
        details: formatZodErrors(error),
      });
    }
    console.error("Update column error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

router.delete("/:columnId", (req: AuthRequest, res: Response) => {
  try {
    const { columnId } = req.params;
    const userId = req.user!.id;

    if (!checkColumnAccess(userId, columnId)) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Column not found",
      });
    }

    const column = db.prepare("SELECT * FROM columns WHERE id = ?").get(columnId) as Column | undefined;

    if (!column) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Column not found",
      });
    }

    const taskCount = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE column_id = ?").get(columnId) as {
      count: number;
    };

    if (taskCount.count > 0) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Cannot delete column with tasks. Move or delete tasks first.",
      });
    }

    db.prepare("DELETE FROM columns WHERE id = ?").run(columnId);

    res.status(204).send();
  } catch (error) {
    console.error("Delete column error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

export default router;
