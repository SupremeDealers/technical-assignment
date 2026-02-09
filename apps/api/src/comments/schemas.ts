import { z } from "zod";

/**
 * Validation schema for creating a comment
 */
export const createCommentSchema = z.object({
  content: z.string().min(1, "Content is required").max(5000, "Content is too long"),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
