import { z } from "zod";

export const registerSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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
});

export const updateColumnSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  position: z.number().int().nonnegative().optional(),
});

export const prioritySchema = z.enum(["low", "medium", "high"]);

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  priority: prioritySchema.optional().default("medium"),
  assignee_id: z.string().uuid().optional().nullable(),
  position: z.number().int().nonnegative().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  priority: prioritySchema.optional(),
  assignee_id: z.string().uuid().optional().nullable(),
  column_id: z.string().uuid().optional(),
  position: z.number().int().nonnegative().optional(),
});

export const taskQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sort: z.enum(["createdAt", "priority", "position"]).optional().default("position"),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, "Content is required").max(2000),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
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
export type Priority = z.infer<typeof prioritySchema>;
