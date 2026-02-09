import { Router, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import * as z from "zod";
import {
  createChecklistItemSchema,
  updateChecklistItemSchema,
  createTimeEntrySchema,
  updateTimeEntrySchema,
  createAttachmentSchema,
  createTaskTemplateSchema,
  updateTaskTemplateSchema,
  activityQuerySchema,
  updateNotificationSchema,
} from "../schemas";
import { sendError } from "../errors";
import db from "../db";
import { authenticate, checkTaskAccess, checkBoardAccess, type AuthRequest } from "../middleware/auth";
import type {
  ChecklistItem,
  TimeEntry,
  TimeEntryWithUser,
  Attachment,
  AttachmentWithUser,
  TaskTemplate,
  Activity,
  ActivityWithUser,
  Notification,
  BoardAnalytics,
  UserPublic,
  PaginatedResponse,
} from "../types";

const router = Router();

router.use(authenticate);

function formatZodErrors(error: z.ZodError) {
  return error.issues.map((e) => ({
    path: e.path.join("."),
    issue: e.message,
  }));
}

// Helper to log activity with rich metadata
export function logActivity(
  boardId: string,
  userId: string,
  action: Activity["action"],
  entityType: Activity["entity_type"],
  entityName: string,
  taskId?: string | null,
  details?: string | null,
  metadata?: Record<string, unknown> | null
) {
  const id = uuidv4();
  const metadataJson = metadata ? JSON.stringify(metadata) : null;
  db.prepare(`
    INSERT INTO activities (id, board_id, task_id, user_id, action, entity_type, entity_name, details, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, boardId, taskId || null, userId, action, entityType, entityName, details || null, metadataJson);
  return id;
}

// Helper to create notification
export function createNotification(
  userId: string,
  type: Notification["type"],
  title: string,
  message: string,
  link?: string
) {
  const id = uuidv4();
  db.prepare(`
    INSERT INTO notifications (id, user_id, type, title, message, link)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, userId, type, title, message, link || null);
  return id;
}

// ============ CHECKLIST ROUTES ============

// Get checklist items for a task
router.get("/tasks/:taskId/checklist", (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.user!.id;

    if (!checkTaskAccess(userId, taskId)) {
      return sendError(res, 404, { code: "NOT_FOUND", message: "Task not found" });
    }

    const items = db.prepare(`
      SELECT * FROM checklist_items WHERE task_id = ? ORDER BY position ASC
    `).all(taskId) as ChecklistItem[];

    res.json({ items });
  } catch (error) {
    console.error("Get checklist error:", error);
    return sendError(res, 500, { code: "INTERNAL", message: "An unexpected error occurred" });
  }
});

// Add checklist item
router.post("/tasks/:taskId/checklist", (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.user!.id;
    const data = createChecklistItemSchema.parse(req.body);

    if (!checkTaskAccess(userId, taskId)) {
      return sendError(res, 404, { code: "NOT_FOUND", message: "Task not found" });
    }

    // Get max position
    const maxPos = db.prepare(`SELECT MAX(position) as max FROM checklist_items WHERE task_id = ?`).get(taskId) as { max: number | null };
    const position = data.position ?? (maxPos.max ?? -1) + 1;

    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO checklist_items (id, task_id, content, position, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, taskId, data.content, position, now, now);

    const item = db.prepare(`SELECT * FROM checklist_items WHERE id = ?`).get(id) as ChecklistItem;

    res.status(201).json({ item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, { code: "BAD_REQUEST", message: "Invalid payload", details: formatZodErrors(error) });
    }
    console.error("Create checklist item error:", error);
    return sendError(res, 500, { code: "INTERNAL", message: "An unexpected error occurred" });
  }
});

// Update checklist item
router.patch("/checklist/:itemId", (req: AuthRequest, res: Response) => {
  try {
    const { itemId } = req.params;
    const userId = req.user!.id;
    const data = updateChecklistItemSchema.parse(req.body);

    const item = db.prepare(`SELECT * FROM checklist_items WHERE id = ?`).get(itemId) as ChecklistItem | undefined;
    if (!item || !checkTaskAccess(userId, item.task_id)) {
      return sendError(res, 404, { code: "NOT_FOUND", message: "Checklist item not found" });
    }

    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: (string | number | boolean)[] = [];

    if (data.content !== undefined) {
      updates.push("content = ?");
      values.push(data.content);
    }
    if (data.is_completed !== undefined) {
      updates.push("is_completed = ?");
      values.push(data.is_completed ? 1 : 0);
    }
    if (data.position !== undefined) {
      updates.push("position = ?");
      values.push(data.position);
    }

    if (updates.length > 0) {
      updates.push("updated_at = ?");
      values.push(now);
      values.push(itemId);
      db.prepare(`UPDATE checklist_items SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    }

    const updatedItem = db.prepare(`SELECT * FROM checklist_items WHERE id = ?`).get(itemId) as ChecklistItem;
    res.json({ item: updatedItem });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, { code: "BAD_REQUEST", message: "Invalid payload", details: formatZodErrors(error) });
    }
    console.error("Update checklist item error:", error);
    return sendError(res, 500, { code: "INTERNAL", message: "An unexpected error occurred" });
  }
});

// Delete checklist item
router.delete("/checklist/:itemId", (req: AuthRequest, res: Response) => {
  try {
    const { itemId } = req.params;
    const userId = req.user!.id;

    const item = db.prepare(`SELECT * FROM checklist_items WHERE id = ?`).get(itemId) as ChecklistItem | undefined;
    if (!item || !checkTaskAccess(userId, item.task_id)) {
      return sendError(res, 404, { code: "NOT_FOUND", message: "Checklist item not found" });
    }

    db.prepare(`DELETE FROM checklist_items WHERE id = ?`).run(itemId);
    res.status(204).send();
  } catch (error) {
    console.error("Delete checklist item error:", error);
    return sendError(res, 500, { code: "INTERNAL", message: "An unexpected error occurred" });
  }
});

// ============ TIME TRACKING ROUTES ============

// Get time entries for a task
router.get("/tasks/:taskId/time-entries", (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.user!.id;

    if (!checkTaskAccess(userId, taskId)) {
      return sendError(res, 404, { code: "NOT_FOUND", message: "Task not found" });
    }

    const entries = db.prepare(`
      SELECT te.*, u.id as user_id, u.email, u.name, u.is_admin, u.created_at as user_created_at
      FROM time_entries te
      JOIN users u ON te.user_id = u.id
      WHERE te.task_id = ?
      ORDER BY te.started_at DESC
    `).all(taskId) as Array<Record<string, unknown>>;

    const entriesWithUser: TimeEntryWithUser[] = entries.map(row => ({
      id: row.id as string,
      task_id: row.task_id as string,
      user_id: row.user_id as string,
      description: row.description as string | null,
      started_at: row.started_at as string,
      ended_at: row.ended_at as string | null,
      duration_minutes: row.duration_minutes as number | null,
      created_at: row.created_at as string,
      user: {
        id: row.user_id as string,
        email: row.email as string,
        name: row.name as string,
        is_admin: Boolean(row.is_admin),
        created_at: row.user_created_at as string,
      },
    }));

    // Calculate total time
    const totalMinutes = entriesWithUser.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);

    res.json({ entries: entriesWithUser, total_minutes: totalMinutes });
  } catch (error) {
    console.error("Get time entries error:", error);
    return sendError(res, 500, { code: "INTERNAL", message: "An unexpected error occurred" });
  }
});

// Add time entry
router.post("/tasks/:taskId/time-entries", (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.user!.id;
    const data = createTimeEntrySchema.parse(req.body);

    if (!checkTaskAccess(userId, taskId)) {
      return sendError(res, 404, { code: "NOT_FOUND", message: "Task not found" });
    }

    const id = uuidv4();
    let duration = data.duration_minutes;

    // Calculate duration if end time is provided
    if (data.ended_at && !duration) {
      const start = new Date(data.started_at);
      const end = new Date(data.ended_at);
      duration = Math.round((end.getTime() - start.getTime()) / 60000);
    }

    db.prepare(`
      INSERT INTO time_entries (id, task_id, user_id, description, started_at, ended_at, duration_minutes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, taskId, userId, data.description || null, data.started_at, data.ended_at || null, duration || null);

    const entry = db.prepare(`
      SELECT te.*, u.id as user_id, u.email, u.name, u.is_admin, u.created_at as user_created_at
      FROM time_entries te
      JOIN users u ON te.user_id = u.id
      WHERE te.id = ?
    `).get(id) as Record<string, unknown>;

    const entryWithUser: TimeEntryWithUser = {
      id: entry.id as string,
      task_id: entry.task_id as string,
      user_id: entry.user_id as string,
      description: entry.description as string | null,
      started_at: entry.started_at as string,
      ended_at: entry.ended_at as string | null,
      duration_minutes: entry.duration_minutes as number | null,
      created_at: entry.created_at as string,
      user: {
        id: entry.user_id as string,
        email: entry.email as string,
        name: entry.name as string,
        is_admin: Boolean(entry.is_admin),
        created_at: entry.user_created_at as string,
      },
    };

    res.status(201).json({ entry: entryWithUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, { code: "BAD_REQUEST", message: "Invalid payload", details: formatZodErrors(error) });
    }
    console.error("Create time entry error:", error);
    return sendError(res, 500, { code: "INTERNAL", message: "An unexpected error occurred" });
  }
});

// Update time entry
router.patch("/time-entries/:entryId", (req: AuthRequest, res: Response) => {
  try {
    const { entryId } = req.params;
    const userId = req.user!.id;
    const data = updateTimeEntrySchema.parse(req.body);

    const entry = db.prepare(`SELECT * FROM time_entries WHERE id = ?`).get(entryId) as TimeEntry | undefined;
    if (!entry || entry.user_id !== userId) {
      return sendError(res, 404, { code: "NOT_FOUND", message: "Time entry not found" });
    }

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.description !== undefined) {
      updates.push("description = ?");
      values.push(data.description);
    }
    if (data.ended_at !== undefined) {
      updates.push("ended_at = ?");
      values.push(data.ended_at);
      
      // Recalculate duration
      if (data.ended_at) {
        const start = new Date(entry.started_at);
        const end = new Date(data.ended_at);
        const duration = Math.round((end.getTime() - start.getTime()) / 60000);
        updates.push("duration_minutes = ?");
        values.push(duration);
      }
    }
    if (data.duration_minutes !== undefined) {
      updates.push("duration_minutes = ?");
      values.push(data.duration_minutes);
    }

    if (updates.length > 0) {
      values.push(entryId);
      db.prepare(`UPDATE time_entries SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    }

    const updatedEntry = db.prepare(`SELECT * FROM time_entries WHERE id = ?`).get(entryId) as TimeEntry;
    res.json({ entry: updatedEntry });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, { code: "BAD_REQUEST", message: "Invalid payload", details: formatZodErrors(error) });
    }
    console.error("Update time entry error:", error);
    return sendError(res, 500, { code: "INTERNAL", message: "An unexpected error occurred" });
  }
});

// Delete time entry
router.delete("/time-entries/:entryId", (req: AuthRequest, res: Response) => {
  try {
    const { entryId } = req.params;
    const userId = req.user!.id;

    const entry = db.prepare(`SELECT * FROM time_entries WHERE id = ?`).get(entryId) as TimeEntry | undefined;
    if (!entry || entry.user_id !== userId) {
      return sendError(res, 404, { code: "NOT_FOUND", message: "Time entry not found" });
    }

    db.prepare(`DELETE FROM time_entries WHERE id = ?`).run(entryId);
    res.status(204).send();
  } catch (error) {
    console.error("Delete time entry error:", error);
    return sendError(res, 500, { code: "INTERNAL", message: "An unexpected error occurred" });
  }
});

// ============ ATTACHMENTS ROUTES ============

// Get attachments for a task
router.get("/tasks/:taskId/attachments", (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.user!.id;

    if (!checkTaskAccess(userId, taskId)) {
      return sendError(res, 404, { code: "NOT_FOUND", message: "Task not found" });
    }

    const attachments = db.prepare(`
      SELECT a.*, u.id as user_id, u.email, u.name, u.is_admin, u.created_at as user_created_at
      FROM attachments a
      JOIN users u ON a.user_id = u.id
      WHERE a.task_id = ?
      ORDER BY a.created_at DESC
    `).all(taskId) as Array<Record<string, unknown>>;

    const attachmentsWithUser: AttachmentWithUser[] = attachments.map(row => ({
      id: row.id as string,
      task_id: row.task_id as string,
      user_id: row.user_id as string,
      filename: row.filename as string,
      url: row.url as string,
      file_type: row.file_type as string | null,
      file_size: row.file_size as number | null,
      created_at: row.created_at as string,
      user: {
        id: row.user_id as string,
        email: row.email as string,
        name: row.name as string,
        is_admin: Boolean(row.is_admin),
        created_at: row.user_created_at as string,
      },
    }));

    res.json({ attachments: attachmentsWithUser });
  } catch (error) {
    console.error("Get attachments error:", error);
    return sendError(res, 500, { code: "INTERNAL", message: "An unexpected error occurred" });
  }
});

// Add attachment
router.post("/tasks/:taskId/attachments", (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.user!.id;
    const data = createAttachmentSchema.parse(req.body);

    if (!checkTaskAccess(userId, taskId)) {
      return sendError(res, 404, { code: "NOT_FOUND", message: "Task not found" });
    }

    const id = uuidv4();

    db.prepare(`
      INSERT INTO attachments (id, task_id, user_id, filename, url, file_type, file_size)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, taskId, userId, data.filename, data.url, data.file_type || null, data.file_size || null);

    const attachment = db.prepare(`
      SELECT a.*, u.id as user_id, u.email, u.name, u.is_admin, u.created_at as user_created_at
      FROM attachments a
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `).get(id) as Record<string, unknown>;

    const attachmentWithUser: AttachmentWithUser = {
      id: attachment.id as string,
      task_id: attachment.task_id as string,
      user_id: attachment.user_id as string,
      filename: attachment.filename as string,
      url: attachment.url as string,
      file_type: attachment.file_type as string | null,
      file_size: attachment.file_size as number | null,
      created_at: attachment.created_at as string,
      user: {
        id: attachment.user_id as string,
        email: attachment.email as string,
        name: attachment.name as string,
        is_admin: Boolean(attachment.is_admin),
        created_at: attachment.user_created_at as string,
      },
    };

    res.status(201).json({ attachment: attachmentWithUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, { code: "BAD_REQUEST", message: "Invalid payload", details: formatZodErrors(error) });
    }
    console.error("Create attachment error:", error);
    return sendError(res, 500, { code: "INTERNAL", message: "An unexpected error occurred" });
  }
});

// Delete attachment
router.delete("/attachments/:attachmentId", (req: AuthRequest, res: Response) => {
  try {
    const { attachmentId } = req.params;
    const userId = req.user!.id;

    const attachment = db.prepare(`SELECT * FROM attachments WHERE id = ?`).get(attachmentId) as Attachment | undefined;
    if (!attachment || !checkTaskAccess(userId, attachment.task_id)) {
      return sendError(res, 404, { code: "NOT_FOUND", message: "Attachment not found" });
    }

    db.prepare(`DELETE FROM attachments WHERE id = ?`).run(attachmentId);
    res.status(204).send();
  } catch (error) {
    console.error("Delete attachment error:", error);
    return sendError(res, 500, { code: "INTERNAL", message: "An unexpected error occurred" });
  }
});

// ============ ACTIVITY LOG ROUTES ============

// Get board activities
router.get("/boards/:boardId/activities", (req: AuthRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const userId = req.user!.id;

    if (!checkBoardAccess(userId, boardId)) {
      return sendError(res, 404, { code: "NOT_FOUND", message: "Board not found" });
    }

    const query = activityQuerySchema.parse(req.query);
    const { page, limit, task_id, action } = query;

    let whereClause = "WHERE a.board_id = ?";
    const params: (string | number)[] = [boardId];

    if (task_id) {
      whereClause += " AND a.task_id = ?";
      params.push(task_id);
    }

    if (action) {
      whereClause += " AND a.action = ?";
      params.push(action);
    }

    const countResult = db.prepare(`SELECT COUNT(*) as total FROM activities a ${whereClause}`).get(...params) as { total: number };
    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const activities = db.prepare(`
      SELECT a.*, u.id as user_id, u.email, u.name, u.is_admin, u.created_at as user_created_at
      FROM activities a
      JOIN users u ON a.user_id = u.id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset) as Array<Record<string, unknown>>;

    const activitiesWithUser: ActivityWithUser[] = activities.map(row => ({
      id: row.id as string,
      board_id: row.board_id as string,
      task_id: row.task_id as string | null,
      user_id: row.user_id as string,
      action: row.action as Activity["action"],
      entity_type: row.entity_type as Activity["entity_type"],
      entity_name: row.entity_name as string,
      details: row.details as string | null,
      metadata: row.metadata as string | null,
      created_at: row.created_at as string,
      user: {
        id: row.user_id as string,
        email: row.email as string,
        name: row.name as string,
        is_admin: Boolean(row.is_admin),
        created_at: row.user_created_at as string,
      },
    }));

    const response: PaginatedResponse<ActivityWithUser> = {
      data: activitiesWithUser,
      pagination: { page, limit, total, totalPages },
    };

    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, { code: "BAD_REQUEST", message: "Invalid query", details: formatZodErrors(error) });
    }
    console.error("Get activities error:", error);
    return sendError(res, 500, { code: "INTERNAL", message: "An unexpected error occurred" });
  }
});

// ============ NOTIFICATIONS ROUTES ============

// Get user notifications
router.get("/notifications", (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const unreadOnly = req.query.unread === "true";

    let whereClause = "WHERE user_id = ?";
    if (unreadOnly) {
      whereClause += " AND is_read = 0";
    }

    const notifications = db.prepare(`
      SELECT * FROM notifications ${whereClause} ORDER BY created_at DESC LIMIT 50
    `).all(userId) as Notification[];

    const unreadCount = db.prepare(`
      SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0
    `).get(userId) as { count: number };

    res.json({ notifications, unread_count: unreadCount.count });
  } catch (error) {
    console.error("Get notifications error:", error);
    return sendError(res, 500, { code: "INTERNAL", message: "An unexpected error occurred" });
  }
});

// Mark notification as read
router.patch("/notifications/:notificationId", (req: AuthRequest, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user!.id;
    const data = updateNotificationSchema.parse(req.body);

    const notification = db.prepare(`SELECT * FROM notifications WHERE id = ? AND user_id = ?`).get(notificationId, userId);
    if (!notification) {
      return sendError(res, 404, { code: "NOT_FOUND", message: "Notification not found" });
    }

    db.prepare(`UPDATE notifications SET is_read = ? WHERE id = ?`).run(data.is_read ? 1 : 0, notificationId);

    const updated = db.prepare(`SELECT * FROM notifications WHERE id = ?`).get(notificationId) as Notification;
    res.json({ notification: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, { code: "BAD_REQUEST", message: "Invalid payload", details: formatZodErrors(error) });
    }
    console.error("Update notification error:", error);
    return sendError(res, 500, { code: "INTERNAL", message: "An unexpected error occurred" });
  }
});

// Mark all notifications as read
router.post("/notifications/mark-all-read", (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    db.prepare(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`).run(userId);
    res.json({ success: true });
  } catch (error) {
    console.error("Mark all read error:", error);
    return sendError(res, 500, { code: "INTERNAL", message: "An unexpected error occurred" });
  }
});

// ============ TASK TEMPLATES ROUTES ============

// Get board templates
router.get("/boards/:boardId/templates", (req: AuthRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const userId = req.user!.id;

    if (!checkBoardAccess(userId, boardId)) {
      return sendError(res, 404, { code: "NOT_FOUND", message: "Board not found" });
    }

    const templates = db.prepare(`
      SELECT * FROM task_templates WHERE board_id = ? ORDER BY name ASC
    `).all(boardId) as TaskTemplate[];

    res.json({ templates });
  } catch (error) {
    console.error("Get templates error:", error);
    return sendError(res, 500, { code: "INTERNAL", message: "An unexpected error occurred" });
  }
});

// Create template
router.post("/boards/:boardId/templates", (req: AuthRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const userId = req.user!.id;
    const data = createTaskTemplateSchema.parse(req.body);

    if (!checkBoardAccess(userId, boardId)) {
      return sendError(res, 404, { code: "NOT_FOUND", message: "Board not found" });
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    const checklistJson = data.checklist_items ? JSON.stringify(data.checklist_items) : null;

    db.prepare(`
      INSERT INTO task_templates (id, board_id, name, title, description, priority, labels, checklist_items, estimated_hours, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, boardId, data.name, data.title, data.description || null, data.priority, data.labels || null, checklistJson, data.estimated_hours || null, userId, now, now);

    const template = db.prepare(`SELECT * FROM task_templates WHERE id = ?`).get(id) as TaskTemplate;
    res.status(201).json({ template });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, { code: "BAD_REQUEST", message: "Invalid payload", details: formatZodErrors(error) });
    }
    console.error("Create template error:", error);
    return sendError(res, 500, { code: "INTERNAL", message: "An unexpected error occurred" });
  }
});

// Update template
router.patch("/templates/:templateId", (req: AuthRequest, res: Response) => {
  try {
    const { templateId } = req.params;
    const userId = req.user!.id;
    const data = updateTaskTemplateSchema.parse(req.body);

    const template = db.prepare(`SELECT * FROM task_templates WHERE id = ?`).get(templateId) as TaskTemplate | undefined;
    if (!template || !checkBoardAccess(userId, template.board_id)) {
      return sendError(res, 404, { code: "NOT_FOUND", message: "Template not found" });
    }

    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.name !== undefined) { updates.push("name = ?"); values.push(data.name); }
    if (data.title !== undefined) { updates.push("title = ?"); values.push(data.title); }
    if (data.description !== undefined) { updates.push("description = ?"); values.push(data.description); }
    if (data.priority !== undefined) { updates.push("priority = ?"); values.push(data.priority); }
    if (data.labels !== undefined) { updates.push("labels = ?"); values.push(data.labels); }
    if (data.checklist_items !== undefined) { updates.push("checklist_items = ?"); values.push(JSON.stringify(data.checklist_items)); }
    if (data.estimated_hours !== undefined) { updates.push("estimated_hours = ?"); values.push(data.estimated_hours); }

    if (updates.length > 0) {
      updates.push("updated_at = ?");
      values.push(now);
      values.push(templateId);
      db.prepare(`UPDATE task_templates SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    }

    const updatedTemplate = db.prepare(`SELECT * FROM task_templates WHERE id = ?`).get(templateId) as TaskTemplate;
    res.json({ template: updatedTemplate });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, { code: "BAD_REQUEST", message: "Invalid payload", details: formatZodErrors(error) });
    }
    console.error("Update template error:", error);
    return sendError(res, 500, { code: "INTERNAL", message: "An unexpected error occurred" });
  }
});

// Delete template
router.delete("/templates/:templateId", (req: AuthRequest, res: Response) => {
  try {
    const { templateId } = req.params;
    const userId = req.user!.id;

    const template = db.prepare(`SELECT * FROM task_templates WHERE id = ?`).get(templateId) as TaskTemplate | undefined;
    if (!template || !checkBoardAccess(userId, template.board_id)) {
      return sendError(res, 404, { code: "NOT_FOUND", message: "Template not found" });
    }

    db.prepare(`DELETE FROM task_templates WHERE id = ?`).run(templateId);
    res.status(204).send();
  } catch (error) {
    console.error("Delete template error:", error);
    return sendError(res, 500, { code: "INTERNAL", message: "An unexpected error occurred" });
  }
});

// ============ BOARD ANALYTICS ROUTES ============

// Get board analytics
router.get("/boards/:boardId/analytics", (req: AuthRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const userId = req.user!.id;

    if (!checkBoardAccess(userId, boardId)) {
      return sendError(res, 404, { code: "NOT_FOUND", message: "Board not found" });
    }

    // Get all tasks for this board
    const tasks = db.prepare(`
      SELECT t.* FROM tasks t
      JOIN columns c ON t.column_id = c.id
      WHERE c.board_id = ? AND t.is_archived = 0
    `).all(boardId) as Array<{ id: string; status: string; priority: string; column_id: string; assignee_id: string | null; due_date: string | null; created_at: string; updated_at: string }>;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "completed").length;
    const overdueTasks = tasks.filter(t => 
      t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed"
    ).length;

    // Tasks by priority
    const tasksByPriority = {
      low: tasks.filter(t => t.priority === "low").length,
      medium: tasks.filter(t => t.priority === "medium").length,
      high: tasks.filter(t => t.priority === "high").length,
    };

    // Tasks by status
    const tasksByStatus = {
      todo: tasks.filter(t => t.status === "todo").length,
      in_progress: tasks.filter(t => t.status === "in_progress").length,
      completed: completedTasks,
    };

    // Tasks by column
    const columns = db.prepare(`SELECT id, name FROM columns WHERE board_id = ? ORDER BY position`).all(boardId) as Array<{ id: string; name: string }>;
    const tasksByColumn = columns.map(col => ({
      column_id: col.id,
      column_name: col.name,
      task_count: tasks.filter(t => t.column_id === col.id).length,
    }));

    // Recent activity count (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recentActivityCount = db.prepare(`
      SELECT COUNT(*) as count FROM activities WHERE board_id = ? AND created_at > ?
    `).get(boardId, weekAgo) as { count: number };

    // Average completion time
    let avgCompletionTimeDays: number | null = null;
    const completedTasksWithTime = tasks.filter(t => t.status === "completed");
    if (completedTasksWithTime.length > 0) {
      const totalDays = completedTasksWithTime.reduce((sum, t) => {
        const created = new Date(t.created_at);
        const completed = new Date(t.updated_at);
        return sum + (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      }, 0);
      avgCompletionTimeDays = Math.round((totalDays / completedTasksWithTime.length) * 10) / 10;
    }

    // Member stats
    const members = db.prepare(`
      SELECT DISTINCT u.id, u.name FROM users u
      LEFT JOIN board_members bm ON u.id = bm.user_id
      JOIN boards b ON b.id = ? AND (b.owner_id = u.id OR bm.board_id = b.id)
    `).all(boardId) as Array<{ id: string; name: string }>;

    const memberStats = members.map(member => ({
      user_id: member.id,
      user_name: member.name,
      assigned_tasks: tasks.filter(t => t.assignee_id === member.id).length,
      completed_tasks: tasks.filter(t => t.assignee_id === member.id && t.status === "completed").length,
    }));

    const analytics: BoardAnalytics = {
      board_id: boardId,
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      overdue_tasks: overdueTasks,
      tasks_by_priority: tasksByPriority,
      tasks_by_status: tasksByStatus,
      tasks_by_column: tasksByColumn,
      recent_activity_count: recentActivityCount.count,
      avg_completion_time_days: avgCompletionTimeDays,
      member_stats: memberStats,
    };

    res.json({ analytics });
  } catch (error) {
    console.error("Get analytics error:", error);
    return sendError(res, 500, { code: "INTERNAL", message: "An unexpected error occurred" });
  }
});

export default router;
