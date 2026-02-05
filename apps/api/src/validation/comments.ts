import { z } from "zod";

export const createCommentBodySchema = z.object({
  body: z.string().min(1, "Comment body is required").max(2000, "Comment too long"),
});

export type CreateCommentBody = z.infer<typeof createCommentBodySchema>;
