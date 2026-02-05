// Use this file to define common error types and a helper function to send error responses in a consistent format across the API.
import type { Response } from "express";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL";

export type ApiError = {
  code: ApiErrorCode;
  message: string;
  details?: unknown;
};

export function sendError(res: Response, status: number, error: ApiError) {
  return res.status(status).json({ error });
}
