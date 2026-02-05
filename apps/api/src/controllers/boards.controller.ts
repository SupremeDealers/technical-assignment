import type { Request, Response } from "express";
import { sendError } from "../errors";
import { parseBody } from "../validation/parse";
import { createColumnBodySchema } from "../validation/boards";
import * as boardService from "../services/board.service";

function parseBoardId(req: Request): number | null {
  const id = Number(req.params.boardId);
  return Number.isInteger(id) && id >= 1 ? id : null;
}

function handleNotFound(res: Response): void {
  sendError(res, 404, { code: "NOT_FOUND", message: "Board not found" });
}

export function getBoard(req: Request, res: Response): void {
  const boardId = parseBoardId(req);
  if (boardId === null) {
    sendError(res, 400, { code: "BAD_REQUEST", message: "Invalid board id" });
    return;
  }
  try {
    const board = boardService.getBoard(boardId);
    res.json(board);
  } catch (err) {
    if (err && typeof err === "object" && (err as { code: string }).code === "NOT_FOUND") {
      handleNotFound(res);
      return;
    }
    throw err;
  }
}

export function getColumns(req: Request, res: Response): void {
  const boardId = parseBoardId(req);
  if (boardId === null) {
    sendError(res, 400, { code: "BAD_REQUEST", message: "Invalid board id" });
    return;
  }
  try {
    const columns = boardService.getColumns(boardId);
    res.json(columns);
  } catch (err) {
    if (err && typeof err === "object" && (err as { code: string }).code === "NOT_FOUND") {
      handleNotFound(res);
      return;
    }
    throw err;
  }
}

export function createColumn(req: Request, res: Response): void {
  const boardId = parseBoardId(req);
  if (boardId === null) {
    sendError(res, 400, { code: "BAD_REQUEST", message: "Invalid board id" });
    return;
  }
  const body = parseBody(res, createColumnBodySchema, req.body);
  if (body === undefined) return;
  try {
    const column = boardService.createColumn(boardId, body);
    res.status(201).json(column);
  } catch (err) {
    if (err && typeof err === "object" && (err as { code: string }).code === "NOT_FOUND") {
      handleNotFound(res);
      return;
    }
    throw err;
  }
}
