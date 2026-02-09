import { z } from "zod";

/**
 * Validation schema for creating a task
 */
export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().max(2000, "Description is too long").optional(),
  priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
  assignedTo: z.number().int().positive().optional(),
});

/**
 * Validation schema for updating a task
 */
export const updateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long").optional(),
  description: z.string().max(2000, "Description is too long").optional().nullable(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  assignedTo: z.number().int().positive().optional().nullable(),
  columnId: z.number().int().positive().optional(), // For moving tasks between columns
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
