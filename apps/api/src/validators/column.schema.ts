import { z } from 'zod';

export const createColumnSchema = z.object({
  title: z.string().min(1, 'Column title is required').max(255),
  order: z.number().int().nonnegative().optional(),
});

export const updateColumnSchema = z.object({
  title: z.string().min(1, 'Column title is required').max(255).optional(),
  order: z.number().int().nonnegative().optional(),
});

export const columnIdParamSchema = z.object({
  id: z.string().uuid('Invalid column ID'),
});

export const boardIdParamSchema = z.object({
  boardId: z.string().uuid('Invalid board ID'),
});

export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;
export type ColumnIdParam = z.infer<typeof columnIdParamSchema>;
export type BoardIdParam = z.infer<typeof boardIdParamSchema>;