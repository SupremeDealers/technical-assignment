import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const createColumnSchema = z.object({
  name: z.string().min(1, "Column name is required"),
  position: z.number().optional(),
});

export const updateColumnSchema = z.object({
  name: z.string().min(1).optional(),
  position: z.number().optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  position: z.number().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  columnId: z.number().optional(),
  position: z.number().optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required"),
});

export const paginationSchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  search: z.string().optional(),
  sort: z.enum(["createdAt", "priority"]).optional().default("createdAt"),
});
