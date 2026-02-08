import type { Request, Response } from "express";
import { sendError } from "../errors";
import { registerSchema, loginSchema } from "../validators/auth";
import { formatZodError } from "../lib/validation";
import { isError } from "../lib/result";
import * as authService from "../services/auth";

export async function register(req: Request, res: Response) {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    sendError(res, 400, {
      code: "BAD_REQUEST",
      message: "Invalid payload",
      details: formatZodError(result.error),
    });
    return;
  }

  const data = await authService.registerUser(result.data);

  if (isError(data)) {
    sendError(res, 409, {
      code: "CONFLICT",
      message: data.error,
    });
    return;
  }

  res.status(201).json(data);
}

export async function login(req: Request, res: Response) {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    sendError(res, 400, {
      code: "BAD_REQUEST",
      message: "Invalid payload",
      details: formatZodError(result.error),
    });
    return;
  }

  const data = await authService.loginUser(result.data);

  if (isError(data)) {
    sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: data.error,
    });
    return;
  }

  res.json(data);
}

export async function me(req: Request, res: Response) {
  const user = await authService.getCurrentUser(req.user!.userId);

  if (!user) {
    sendError(res, 404, {
      code: "NOT_FOUND",
      message: "User not found",
    });
    return;
  }

  res.json({ user });
}
