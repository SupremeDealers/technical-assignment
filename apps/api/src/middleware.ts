import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";
import { sendError } from "./errors.js";

export function validate(schema: ZodSchema, source: "body" | "query" = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(source === "body" ? req.body : req.query);
    if (!result.success) {
      const details = result.error.issues.map((e) => ({
        path: e.path.join("."),
        issue: e.message,
      }));
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid payload",
        details,
      });
    }
    if (source === "body") {
      req.body = result.data;
    } else {
      (req as any).validatedQuery = result.data;
    }
    next();
  };
}
