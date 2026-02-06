import { z } from "zod";

export const createColumnSchema = z.object({
  name: z.string().min(1, "Column name required"),
});

export const updateColumnSchema = z.object({
  name: z.string().min(1).optional(),
  order: z.number().int().positive().optional(),
});
