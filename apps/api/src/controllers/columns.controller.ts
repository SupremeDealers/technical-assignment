import type { Request, Response } from "express";
import { sendError } from "../errors";
import { parseBody } from "../validation/parse";
import { patchColumnBodySchema } from "../validation/boards";
import * as columnService from "../services/column.service";

function parseColumnId(req: Request): number | null {
  const id = Number(req.params.columnId);
  return Number.isInteger(id) && id >= 1 ? id : null;
}

export function patchColumn(req: Request, res: Response): void {
  const columnId = parseColumnId(req);
  if (columnId === null) {
    sendError(res, 400, { code: "BAD_REQUEST", message: "Invalid column id" });
    return;
  }
  const body = parseBody(res, patchColumnBodySchema, req.body);
  if (body === undefined) return;
  try {
    const column = columnService.updateColumn(columnId, body);
    res.json(column);
  } catch (err) {
    if (err && typeof err === "object" && (err as { code: string }).code === "NOT_FOUND") {
      sendError(res, 404, { code: "NOT_FOUND", message: "Column not found" });
      return;
    }
    throw err;
  }
}

export function deleteColumn(req: Request, res: Response): void {
  const columnId = parseColumnId(req);
  if (columnId === null) {
    sendError(res, 400, { code: "BAD_REQUEST", message: "Invalid column id" });
    return;
  }
  try {
    columnService.deleteColumn(columnId);
    res.status(204).send();
  } catch (err) {
    if (err && typeof err === "object" && (err as { code: string }).code === "NOT_FOUND") {
      sendError(res, 404, { code: "NOT_FOUND", message: "Column not found" });
      return;
    }
    throw err;
  }
}
