import type { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "./auth.schema";
import * as authService from "./auth.service";

//! REGISTER

export async function registerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = registerSchema.parse(req.body);

    const result = await authService.register(input);

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

//! LOGIN

export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = loginSchema.parse(req.body);

    const result = await authService.login(input);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}
