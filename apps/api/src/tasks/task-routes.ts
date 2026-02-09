import { Router } from "express";
import { getDb } from "../db/index";
import { sendError } from "../errors";
import { authenticate } from "../auth/middleware";
import { updateTaskSchema } from "../tasks/schemas";
import { ZodError } from "zod";

const router = Router();

// All task routes require authentication
router.use(authenticate);

/**
 * PATCH /tasks/:taskId
 * Update a task (title, description, priority, assignedTo, or move to another column)
 */
router.patch("/:taskId", (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    
    if (isNaN(taskId)) {
      sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid task ID",
      });
      return;
    }

    // Validate request body
    const data = updateTaskSchema.parse(req.body);

    if (
      !data.title &&
      data.description === undefined &&
      !data.priority &&
      data.assignedTo === undefined &&
      !data.columnId
    ) {
      sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "At least one field must be provided",
      });
      return;
    }

    const db = getDb();

    // Verify task exists
    const task = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(taskId) as
      | {
          id: number;
          column_id: number;
          title: string;
        }
      | undefined;

    if (!task) {
      sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found",
      });
      return;
    }

    // If moving to another column, verify it exists
    if (data.columnId && data.columnId !== task.column_id) {
      const column = db
        .prepare("SELECT id FROM columns WHERE id = ?")
        .get(data.columnId);

      if (!column) {
        sendError(res, 400, {
          code: "BAD_REQUEST",
          message: "Target column not found",
        });
        return;
      }
    }

    // If assignedTo is provided, verify user exists (null is allowed for unassigning)
    if (data.assignedTo !== undefined && data.assignedTo !== null) {
      const user = db
        .prepare("SELECT id FROM users WHERE id = ?")
        .get(data.assignedTo);

      if (!user) {
        sendError(res, 400, {
          code: "BAD_REQUEST",
          message: "Assigned user not found",
        });
        return;
      }
    }

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];

    if (data.title) {
      updates.push("title = ?");
      values.push(data.title);
    }

    if (data.description !== undefined) {
      updates.push("description = ?");
      values.push(data.description);
    }

    if (data.priority) {
      updates.push("priority = ?");
      values.push(data.priority);
    }

    if (data.assignedTo !== undefined) {
      updates.push("assigned_to = ?");
      values.push(data.assignedTo);
    }

    if (data.columnId) {
      updates.push("column_id = ?");
      values.push(data.columnId);
    }

    updates.push("updated_at = datetime('now')");
    values.push(taskId);

    // Update task
    db.prepare(`UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`).run(
      ...values
    );

    // Fetch updated task with user info
    const updated = db
      .prepare(
        `
        SELECT 
          t.*,
          u1.name as creator_name,
          u1.email as creator_email,
          u2.name as assignee_name,
          u2.email as assignee_email
        FROM tasks t
        JOIN users u1 ON t.created_by = u1.id
        LEFT JOIN users u2 ON t.assigned_to = u2.id
        WHERE t.id = ?
      `
      )
      .get(taskId) as {
        id: number;
        column_id: number;
        title: string;
        description: string | null;
        priority: string;
        created_by: number;
        assigned_to: number | null;
        created_at: string;
        updated_at: string;
        creator_name: string;
        creator_email: string;
        assignee_name: string | null;
        assignee_email: string | null;
      };

    res.json({
      id: updated.id,
      columnId: updated.column_id,
      title: updated.title,
      description: updated.description,
      priority: updated.priority,
      createdBy: {
        id: updated.created_by,
        name: updated.creator_name,
        email: updated.creator_email,
      },
      assignedTo: updated.assigned_to
        ? {
            id: updated.assigned_to,
            name: updated.assignee_name!,
            email: updated.assignee_email!,
          }
        : null,
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

    console.error("[tasks] Update task error:", error);
    sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to update task",
    });
  }
});

/**
 * DELETE /tasks/:taskId
 * Delete a task
 */
router.delete("/:taskId", (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    
    if (isNaN(taskId)) {
      sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid task ID",
      });
      return;
    }

    const db = getDb();

    // Verify task exists
    const task = db
      .prepare("SELECT id FROM tasks WHERE id = ?")
      .get(taskId);

    if (!task) {
      sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found",
      });
      return;
    }

    // Delete task (comments will be cascade deleted due to foreign key)
    db.prepare("DELETE FROM tasks WHERE id = ?").run(taskId);

    res.status(204).send();
  } catch (error) {
    console.error("[tasks] Delete task error:", error);
    sendError(res, 500, {
      code: "INTERNAL_ERROR",
      message: "Failed to delete task",
    });
  }
});

export default router;
