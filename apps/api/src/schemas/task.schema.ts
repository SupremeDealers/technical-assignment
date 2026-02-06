import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  columnId: z.string().uuid(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const moveTaskSchema = z.object({
  columnId: z.string().uuid(),
  position: z.number().int().optional(),
});
