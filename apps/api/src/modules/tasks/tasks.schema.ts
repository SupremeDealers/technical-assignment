import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Task title required"),
  description: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  columnId: z.string().optional(),
  order: z.number().int().positive().optional(),
});

export const taskQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().optional().transform((v) => (v ? parseInt(v) : 1)),
  limit: z.string().optional().transform((v) => (v ? parseInt(v) : 10)),
  sort: z
    .enum(["createdAt", "title"])
    .optional()
    .default("createdAt"),
});
