import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";
import { createError } from "../utils/createError";

export const validate =
  (schema: ZodSchema, property: "body" | "params" | "query" = "body") =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req[property]);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          path: issue.path,
          message: issue.message,
        }));
        next(
          createError(400, "Validation failed", {
            errors,
          })
        );
      } else {
        next(error);
      }
    }
  };
