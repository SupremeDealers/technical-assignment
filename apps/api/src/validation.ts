import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createBoardSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export const updateBoardSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const createColumnSchema = z.object({
  name: z.string().min(1, "Name is required"),
  position: z.number().int().min(0).optional(),
});

export const updateColumnSchema = z.object({
  name: z.string().min(1).optional(),
  position: z.number().int().min(0).optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  position: z.number().int().min(0).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  position: z.number().int().min(0).optional(),
  column_id: z.number().int().optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, "Content is required"),
});

export const taskQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  sort: z.enum(["createdAt", "priority", "title"]).optional(),
});
