import { z } from "zod";

export const createColumnSchema = z.object({
  name: z.string().min(1, "Column name is required"),
});

export const updateColumnSchema = z.object({
  name: z.string().min(1, "Column name is required").optional(),
  order: z.number().int().min(0).optional(),
});

export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;
