import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(255),
  description: z.string().max(5000).optional().nullable(),
  order: z.number().int().nonnegative().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(255).optional(),
  description: z.string().max(5000).optional().nullable(),
  order: z.number().int().nonnegative().optional(),
});

export const moveTaskSchema = z.object({
  columnId: z.string().uuid('Invalid column ID'),
  order: z.number().int().nonnegative(),
});

export const taskIdParamSchema = z.object({
  id: z.string().uuid('Invalid task ID'),
});

export const columnIdParamSchema = z.object({
  columnId: z.string().uuid('Invalid column ID'),
});

export const boardIdParamSchema = z.object({
  boardId: z.string().uuid('Invalid board ID'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
export type TaskIdParam = z.infer<typeof taskIdParamSchema>;
export type ColumnIdParam = z.infer<typeof columnIdParamSchema>;
export type BoardIdParam = z.infer<typeof boardIdParamSchema>;