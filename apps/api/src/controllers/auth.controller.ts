import type { Request, Response } from "express";
import { sendError } from "../errors";
import { parseBody } from "../validation/parse";
import { registerBodySchema, loginBodySchema } from "../validation/auth";
import * as authService from "../services/auth.service";

function handleServiceError(res: Response, err: unknown): void {
  if (err && typeof err === "object" && "code" in err && "message" in err) {
    const code = (err as { code: string }).code;
    const message = (err as { message: string }).message;
    const status = code === "CONFLICT" ? 409 : code === "UNAUTHORIZED" ? 401 : 400;
    sendError(res, status, { code: code as "CONFLICT" | "UNAUTHORIZED", message });
    return;
  }
  throw err;
}

export function register(req: Request, res: Response): void {
  const body = parseBody(res, registerBodySchema, req.body);
  if (body === undefined) return;
  try {
    const result = authService.register(body);
    res.status(201).json(result);
  } catch (err) {
    console.log("err", err);
    handleServiceError(res, err);
  }
}

export function login(req: Request, res: Response): void {
  const body = parseBody(res, loginBodySchema, req.body);
  if (body === undefined) return;
  try {
    const result = authService.login(body);
    res.json(result);
  } catch (err) {
    handleServiceError(res, err);
  }
}
