import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { sendError } from "../errors";
import { env } from "../config/env";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  //   * Safe Logging

  if (env.NODE_ENV !== "production") {
    console.error("Error:", err);
  } else {
    console.error("Unhandled error occurred");
  }

  //  * Zod Validation Error

  if (err instanceof ZodError) {
    return sendError(res, 400, {
      code: "BAD_REQUEST",
      message: "Validation failed",
      details: err.errors.map((e) => ({
        path: e.path.join("."),
        issue: e.message,
      })),
    });
  }

  //  * Mongo Duplicate Key

  if (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    "code" in err &&
    (err as { name?: string }).name === "MongoServerError" &&
    (err as { code?: number }).code === 11000
  ) {
    return sendError(res, 409, {
      code: "CONFLICT",
      message: "Resource already exists",
    });
  }

  //!    JWT Errors

  if (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    (err as { name?: string }).name === "JsonWebTokenError"
  ) {
    return sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Invalid token",
    });
  }

  if (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    (err as { name?: string }).name === "TokenExpiredError"
  ) {
    return sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Token expired",
    });
  }


 //  * Generic Fallback
// Always return a generic message to avoid leaking details
  return sendError(res, 500, {
    code: "INTERNAL",
    message: "Internal server error",
  });
}
