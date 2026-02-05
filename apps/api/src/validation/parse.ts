import type { Response } from "express";
import type { z } from "zod";
import { sendError } from "../errors";

export type ApiErrorDetail = { path: string; issue: string };

export function parseBody<T>(res: Response, schema: z.ZodType<T>, body: unknown): T | undefined {
  const result = schema.safeParse(body);
  if (result.success) return result.data;
  const details: ApiErrorDetail[] = result.error.issues.map((issue) => ({
    path: issue.path.join(".") || "body",
    issue: issue.message,
  }));
  sendError(res, 400, {
    code: "BAD_REQUEST",
    message: "Invalid payload",
    details,
  });
  return undefined;
}

export function parseQuery<T>(res: Response, schema: z.ZodType<T>, query: unknown): T | undefined {
  const result = schema.safeParse(query);
  if (result.success) return result.data;
  const details: ApiErrorDetail[] = result.error.issues.map((issue) => ({
    path: issue.path.join(".") || "query",
    issue: issue.message,
  }));
  sendError(res, 400, {
    code: "BAD_REQUEST",
    message: "Invalid query",
    details,
  });
  return undefined;
}
