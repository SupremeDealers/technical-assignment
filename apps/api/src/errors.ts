import type { Response } from "express";
import z from "zod";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL";

export type ApiError = {
  message: string;
  details?: unknown;
};

export function sendError(res: Response, status: number, error: ApiError) {
  return res.status(status).json({ ...error });
}
export function zodError(res: Response, error: any) {
  console.error("Zod validation error:", error);
  // If error has a statusCode, use it
  if (typeof error?.statusCode === "number") {
    return sendError(res, error.statusCode, {
      message: error.message,
    });
  }
  if (
    error instanceof z.ZodError &&
    error.issues &&
    error.issues.length > 0
  ) {
    const err = error.issues[0];
    return sendError(res, 400, {
      message: err.message,
    });
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.startsWith("[") &&
    error.message.includes("message")
  ) {
    try {
      const arr = JSON.parse(error.message as string);
      if (Array.isArray(arr) && arr.length > 0) {
        const err = arr[0];
        return sendError(res, 400, {
          message: err.message,
        });
      }
    } catch (e) {}
  }

  return sendError(res, 500, {
    message:
      error instanceof Error
        ? error.message
        : "An error occurred during registeration",
  });
}
