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
export function zodError(res: Response, error: z.ZodError) {
  if (
    error instanceof z.ZodError &&
    (error as z.ZodError).issues &&
    (error as z.ZodError).issues.length > 0
  ) {
    const err = (error as z.ZodError).issues[0];
    return sendError(res, 400, {
      message: err.message,
    });
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string" &&
    (error as { message: string }).message.startsWith("[") &&
    (error as { message: string }).message.includes("message")
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
