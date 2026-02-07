import { Router, type Response } from "express";
import { db } from "../db/db";
import { sendError } from "../errors";
import { type AuthRequest, authenticate } from "../auth";
import { updateColumnSchema } from "../validation";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Update a column
router.patch("/:columnId", async (req: AuthRequest, res: Response) => {
  try {
    const result = updateColumnSchema.safeParse(req.body);

    if (!result.success) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid request body",
        details: result.error.issues.map((e) => ({
          path: e.path.join("."),
          issue: e.message,
        })),
      });
    }

    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (result.data.name !== undefined) {
      updates.push("name = ?");
      values.push(result.data.name);
    }

    if (result.data.position !== undefined) {
      updates.push("position = ?");
      values.push(result.data.position);
    }

    if (updates.length === 0) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "No fields to update",
      });
    }

    values.push(req.params.columnId);

    db.prepare(`UPDATE columns SET ${updates.join(", ")} WHERE id = ?`).run(
      ...values
    );

    const column = db
      .prepare("SELECT * FROM columns WHERE id = ?")
      .get(req.params.columnId);

    if (!column) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Column not found",
      });
    }

    res.json(column);
  } catch (error) {
    console.error("[columns/:columnId] Error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to update column",
    });
  }
});

// Delete a column
router.delete("/:columnId", async (req: AuthRequest, res: Response) => {
  try {
    const column = db
      .prepare("SELECT * FROM columns WHERE id = ?")
      .get(req.params.columnId);

    if (!column) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Column not found",
      });
    }

    db.prepare("DELETE FROM columns WHERE id = ?").run(req.params.columnId);

    res.status(204).send();
  } catch (error) {
    console.error("[columns/:columnId] Error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to delete column",
    });
  }
});

export default router;
