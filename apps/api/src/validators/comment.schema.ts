import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(5000),
});

export const commentIdParamSchema = z.object({
  id: z.string().uuid('Invalid comment ID'),
});

export const taskIdParamSchema = z.object({
  taskId: z.string().uuid('Invalid task ID'),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CommentIdParam = z.infer<typeof commentIdParamSchema>;
export type TaskIdParam = z.infer<typeof taskIdParamSchema>;