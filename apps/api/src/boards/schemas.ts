import { z } from "zod";

/**
 * Validation schema for creating a column
 */
export const createColumnSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  position: z.number().int().min(0).optional(),
});

/**
 * Validation schema for updating a column
 */
export const updateColumnSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long").optional(),
  position: z.number().int().min(0).optional(),
});

/**
 * Validation schema for creating a board
 */
export const createBoardSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().max(1000, "Description is too long").optional(),
});

export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;
export type CreateBoardInput = z.infer<typeof createBoardSchema>;
