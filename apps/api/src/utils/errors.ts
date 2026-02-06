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

export class ServiceError extends Error {
  constructor(
    public status: number,
    public code: ApiErrorCode,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

export function sendError(res: Response, status: number, error: ApiError) {
  return res.status(status).json({ error });
}
