import { z } from "zod";

const prioritySchema = z.enum(["low", "medium", "high"]);

export const createTaskBodySchema = z.object({
  title: z.string().min(1, "Title is required").max(500, "Title too long"),
  description: z.string().max(5000).optional(),
  priority: prioritySchema.optional().default("medium"),
});

export const patchTaskBodySchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).optional().nullable(),
  priority: prioritySchema.optional(),
  columnId: z.number().int().positive().optional(),
});

export const taskQuerySchema = z.object({
  search: z.string().optional().default(""),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sort: z.enum(["createdAt", "priority"]).optional().default("createdAt"),
});

export type CreateTaskBody = z.infer<typeof createTaskBodySchema>;
export type PatchTaskBody = z.infer<typeof patchTaskBodySchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;
