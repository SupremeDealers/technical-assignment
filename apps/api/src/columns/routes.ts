import { Router } from "express";
import { getDb } from "../db/index";
import { sendError } from "../errors";
import { authenticate } from "../auth/middleware";
import { updateColumnSchema } from "../boards/schemas";
import { ZodError } from "zod";

const router = Router();

// All column routes require authentication
router.use(authenticate);

/**
 * PATCH /columns/:columnId
 * Update a column (title and/or position)
 */
router.patch("/:columnId", (req, res) => {
  try {
    const columnId = parseInt(req.params.columnId);
    
    if (isNaN(columnId)) {
      sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid column ID",
      });
      return;
    }

    // Validate request body
    const data = updateColumnSchema.parse(req.body);

    if (!data.title && data.position === undefined) {
      sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "At least one field (title or position) must be provided",
      });
      return;
    }

    const db = getDb();

    // Verify column exists
    const column = db
      .prepare("SELECT * FROM columns WHERE id = ?")
      .get(columnId) as
      | {
          id: number;
          board_id: number;
          title: string;
          position: number;
        }
      | undefined;

    if (!column) {
      sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Column not found",
      });
      return;
    }

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];

    if (data.title) {
      updates.push("title = ?");
      values.push(data.title);
    }

    if (data.position !== undefined) {
      updates.push("position = ?");
      values.push(data.position);
    }

    updates.push("updated_at = datetime('now')");
    values.push(columnId);

    // Update column
    db.prepare(`UPDATE columns SET ${updates.join(", ")} WHERE id = ?`).run(
      ...values
    );

    // Fetch updated column with task count
    const updated = db
      .prepare(
        `
        SELECT 
          c.*,
          COUNT(t.id) as task_count
        FROM columns c
        LEFT JOIN tasks t ON t.column_id = c.id
        WHERE c.id = ?
        GROUP BY c.id
      `
      )
      .get(columnId) as {
        id: number;
        board_id: number;
        title: string;
        position: number;
        created_at: string;
        updated_at: string;
        task_count: number;
      };

    res.json({
      id: updated.id,
      boardId: updated.board_id,
      title: updated.title,
      position: updated.position,
      taskCount: updated.task_count,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      sendError(res, 400, {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: error.issues.map((e) => ({
          path: e.path.join("."),
          issue: e.message,
        })),
      });
      return;
    }

    console.error("[columns] Update column error:", error);
    sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to update column",
    });
  }
});

/**
 * DELETE /columns/:columnId
 * Delete a column
 */
router.delete("/:columnId", (req, res) => {
  try {
    const columnId = parseInt(req.params.columnId);
    
    if (isNaN(columnId)) {
      sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid column ID",
      });
      return;
    }

    const db = getDb();

    // Verify column exists
    const column = db
      .prepare("SELECT id FROM columns WHERE id = ?")
      .get(columnId);

    if (!column) {
      sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Column not found",
      });
      return;
    }

    // Delete column (tasks will be cascade deleted due to foreign key)
    db.prepare("DELETE FROM columns WHERE id = ?").run(columnId);

    res.status(204).send();
  } catch (error) {
    console.error("[columns] Delete column error:", error);
    sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to delete column",
    });
  }
});

export default router;
