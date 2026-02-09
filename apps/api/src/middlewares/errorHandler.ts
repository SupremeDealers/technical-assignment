import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { sendError } from "../utils/response";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Zod validation errors
  if (err instanceof ZodError) {
    return sendError(res, "Validation failed", 400, err.issues);
  }

  // Functional errors (createError)
  if (err?.status) {
    return sendError(res, err.message, err.status, err.errors);
  }

  // Log unexpected errors
  console.error("Unexpected error:", err);

  return sendError(res, "Internal server error", 500);
};
