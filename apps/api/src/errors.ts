import type { Response } from "express";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL"
  | "COLUMN_TASK_LIMIT_REACHED"
  | "DUPLICATE_TITLE"
  | "INVALID_DUE_DATE"
  | "VALIDATION_ERROR";

export type ApiError = {
  code: ApiErrorCode;
  message: string;
  details?: unknown;
};

export function sendError(res: Response, status: number, error: ApiError) {
  return res.status(status).json({ error });
}
