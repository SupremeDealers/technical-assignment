import { z } from "zod";

export const createColumnBodySchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  position: z.number().int().min(0).optional(),
});

export const patchColumnBodySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  position: z.number().int().min(0).optional(),
});

export type CreateColumnBody = z.infer<typeof createColumnBodySchema>;
export type PatchColumnBody = z.infer<typeof patchColumnBodySchema>;
