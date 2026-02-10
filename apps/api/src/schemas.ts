import { z } from "zod";

// ── Auth schemas ────────────────────────────────────────────────────
export const registerSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ── Board schemas ───────────────────────────────────────────────────
export const createBoardSchema = z.object({
  name: z.string().min(1).max(100),
});

// ── Column schemas ──────────────────────────────────────────────────
export const createColumnSchema = z.object({
  name: z.string().min(1).max(100),
});

export const updateColumnSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  position: z.number().int().min(0).optional(),
});

// ── Task schemas ────────────────────────────────────────────────────
export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  assignee_id: z.number().int().positive().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  column_id: z.number().int().positive().optional(),
  assignee_id: z.number().int().positive().nullable().optional(),
  position: z.number().int().min(0).optional(),
});

// ── Comment schemas ─────────────────────────────────────────────────
export const createCommentSchema = z.object({
  body: z.string().min(1).max(5000),
});

// ── Query schemas ───────────────────────────────────────────────────
export const taskQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["createdAt", "priority", "position"]).default("position"),
});
