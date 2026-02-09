import { z } from "zod";

export const registerSchema = z.object({
  email: z.email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  name: z.string().min(1, "Name is required").max(100),
});

export const loginSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const createBoardSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});

export const updateBoardSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export const createColumnSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  position: z.number().int().nonnegative().optional(),
  max_tasks: z.number().int().positive().max(100).optional().nullable(),
});

export const updateColumnSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  position: z.number().int().nonnegative().optional(),
  max_tasks: z.number().int().positive().max(100).optional().nullable(),
});

export const prioritySchema = z.enum(["low", "medium", "high"]);
export const statusSchema = z.enum(["todo", "in_progress", "completed"]);
export const roleSchema = z.enum(["owner", "admin", "member"]);

// Labels should be comma-separated values, max 5 labels
const labelsSchema = z.string().max(200).optional().nullable().refine(
  (val) => {
    if (!val) return true;
    const labels = val.split(",").map(l => l.trim()).filter(Boolean);
    return labels.length <= 5 && labels.every(l => l.length <= 30);
  },
  { message: "Maximum 5 labels allowed, each up to 30 characters" }
);

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200)
    .regex(/^[^<>]*$/, "Title cannot contain < or > characters"),
  description: z.string().max(2000).optional(),
  priority: prioritySchema.optional().default("medium"),
  status: statusSchema.optional().default("todo"),
  assignee_id: z.string().uuid().optional().nullable(),
  position: z.number().int().nonnegative().optional(),
  due_date: z.string().datetime().optional().nullable(),
  labels: labelsSchema,
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[^<>]*$/, "Title cannot contain < or > characters")
    .optional(),
  description: z.string().max(2000).optional().nullable(),
  priority: prioritySchema.optional(),
  status: statusSchema.optional(),
  assignee_id: z.string().uuid().optional().nullable(),
  column_id: z.string().uuid().optional(),
  position: z.number().int().nonnegative().optional(),
  due_date: z.string().datetime().optional().nullable(),
  labels: labelsSchema,
});

export const taskQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sort: z.enum(["createdAt", "priority", "position", "dueDate", "status"]).optional().default("position"),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
  status: statusSchema.optional(),
  priority: prioritySchema.optional(),
  assignee_id: z.string().uuid().optional(),
  overdue: z.coerce.boolean().optional(),
});

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(2000)
    .regex(/^[^<>]*$/, "Content cannot contain < or > characters"),
});

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1)
    .max(2000)
    .regex(/^[^<>]*$/, "Content cannot contain < or > characters"),
});

// Board member management schemas
export const addBoardMemberSchema = z.object({
  email: z.email("Invalid email format"),
  role: roleSchema.optional().default("member"),
});

export const updateBoardMemberSchema = z.object({
  role: roleSchema,
});

// ============ Checklist Schemas ============
export const createChecklistItemSchema = z.object({
  content: z.string().min(1, "Content is required").max(500),
  position: z.number().int().nonnegative().optional(),
});

export const updateChecklistItemSchema = z.object({
  content: z.string().min(1).max(500).optional(),
  is_completed: z.boolean().optional(),
  position: z.number().int().nonnegative().optional(),
});

// ============ Time Entry Schemas ============
export const createTimeEntrySchema = z.object({
  description: z.string().max(500).optional(),
  started_at: z.string().datetime(),
  ended_at: z.string().datetime().optional().nullable(),
  duration_minutes: z.number().int().positive().max(1440).optional(), // max 24 hours
});

export const updateTimeEntrySchema = z.object({
  description: z.string().max(500).optional().nullable(),
  ended_at: z.string().datetime().optional().nullable(),
  duration_minutes: z.number().int().positive().max(1440).optional(),
});

// ============ Attachment Schemas ============
export const createAttachmentSchema = z.object({
  filename: z.string().min(1).max(255),
  url: z.string().url().max(2000),
  file_type: z.string().max(100).optional(),
  file_size: z.number().int().positive().optional(),
});

// ============ Notification Schemas ============
export const notificationTypeSchema = z.enum(["task_assigned", "task_completed", "comment_added", "due_date_reminder", "mentioned"]);

export const updateNotificationSchema = z.object({
  is_read: z.boolean(),
});

// ============ Task Template Schemas ============
export const createTaskTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required").max(100),
  title: z.string().min(1, "Task title is required").max(200),
  description: z.string().max(2000).optional(),
  priority: prioritySchema.optional().default("medium"),
  labels: labelsSchema,
  checklist_items: z.array(z.string().max(500)).max(20).optional(),
  estimated_hours: z.number().positive().max(1000).optional(),
});

export const updateTaskTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  priority: prioritySchema.optional(),
  labels: labelsSchema,
  checklist_items: z.array(z.string().max(500)).max(20).optional(),
  estimated_hours: z.number().positive().max(1000).optional().nullable(),
});

// ============ Activity Query Schemas ============
export const activityQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  task_id: z.string().uuid().optional(),
  action: z.enum(["created", "updated", "deleted", "moved", "commented", "assigned", "completed", "archived"]).optional(),
});

// ============ Extended Task Schema ============
export const createTaskWithFeaturesSchema = createTaskSchema.extend({
  estimated_hours: z.number().positive().max(1000).optional(),
  checklist_items: z.array(z.string().max(500)).max(20).optional(),
});

export const updateTaskWithFeaturesSchema = updateTaskSchema.extend({
  estimated_hours: z.number().positive().max(1000).optional().nullable(),
  is_archived: z.boolean().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type AddBoardMemberInput = z.infer<typeof addBoardMemberSchema>;
export type UpdateBoardMemberInput = z.infer<typeof updateBoardMemberSchema>;
export type Priority = z.infer<typeof prioritySchema>;
export type Status = z.infer<typeof statusSchema>;
export type Role = z.infer<typeof roleSchema>;
export type CreateChecklistItemInput = z.infer<typeof createChecklistItemSchema>;
export type UpdateChecklistItemInput = z.infer<typeof updateChecklistItemSchema>;
export type CreateTimeEntryInput = z.infer<typeof createTimeEntrySchema>;
export type UpdateTimeEntryInput = z.infer<typeof updateTimeEntrySchema>;
export type CreateAttachmentInput = z.infer<typeof createAttachmentSchema>;
export type CreateTaskTemplateInput = z.infer<typeof createTaskTemplateSchema>;
export type UpdateTaskTemplateInput = z.infer<typeof updateTaskTemplateSchema>;
export type ActivityQueryInput = z.infer<typeof activityQuerySchema>;
export type NotificationType = z.infer<typeof notificationTypeSchema>;
