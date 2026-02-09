import { z } from 'zod';

export const createBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required').max(255),
});

export const updateBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required').max(255),
});

export const boardIdParamSchema = z.object({
  id: z.string().uuid('Invalid board ID'),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type BoardIdParam = z.infer<typeof boardIdParamSchema>;