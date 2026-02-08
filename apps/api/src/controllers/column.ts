import type { Request, Response } from "express";
import { sendError } from "../errors";
import { updateColumnSchema } from "../validators/column";
import { formatZodError } from "../lib/validation";
import { isError } from "../lib/result";
import * as columnService from "../services/column";

export async function updateColumn(req: Request, res: Response) {
  const result = updateColumnSchema.safeParse(req.body);

  if (!result.success) {
    sendError(res, 400, {
      code: "BAD_REQUEST",
      message: "Invalid payload",
      details: formatZodError(result.error),
    });
    return;
  }

  const data = await columnService.updateColumn(
    req.params.columnId,
    result.data,
    req.user!.userId
  );

  if (isError(data)) {
    sendError(res, 404, {
      code: "NOT_FOUND",
      message: data.error,
    });
    return;
  }

  res.json(data);
}

export async function deleteColumn(req: Request, res: Response) {
  const data = await columnService.deleteColumn(
    req.params.columnId,
    req.user!.userId
  );

  if (isError(data)) {
    sendError(res, 404, {
      code: "NOT_FOUND",
      message: data.error,
    });
    return;
  }

  res.status(204).send();
}
