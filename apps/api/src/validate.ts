import type { Response } from "express";
import type { ZodSchema } from "zod";
import { sendError } from "./errors";

export function parseOrError<T>(
  res: Response,
  schema: ZodSchema<T>,
  data: unknown
) {
  const result = schema.safeParse(data);
  if (!result.success) {
    sendError(res, 400, {
      code: "BAD_REQUEST",
      message: "Invalid payload",
      details: result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        issue: issue.message,
      })),
    });
    return null;
  }
  return result.data;
}
