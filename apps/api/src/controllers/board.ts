import type { Request, Response } from "express";
import { sendError } from "../errors";
import { createBoardSchema } from "../validators/board";
import { createColumnSchema } from "../validators/column";
import { formatZodError } from "../lib/validation";
import { isError } from "../lib/result";
import * as boardService from "../services/board";
import * as columnService from "../services/column";

export async function createBoard(req: Request, res: Response) {
  const result = createBoardSchema.safeParse(req.body);

  if (!result.success) {
    sendError(res, 400, {
      code: "BAD_REQUEST",
      message: "Invalid payload",
      details: formatZodError(result.error),
    });
    return;
  }

  const board = await boardService.createBoard(result.data, req.user!.userId);
  res.status(201).json({ board });
}

export async function getBoards(req: Request, res: Response) {
  const boards = await boardService.getBoardsByUser(req.user!.userId);
  res.json({ boards });
}

export async function getBoard(req: Request, res: Response) {
  const board = await boardService.getBoardById(
    req.params.boardId,
    req.user!.userId
  );

  if (!board) {
    sendError(res, 404, {
      code: "NOT_FOUND",
      message: "Board not found",
    });
    return;
  }

  res.json({ board });
}

export async function getBoardColumns(req: Request, res: Response) {
  const columns = await boardService.getBoardColumns(
    req.params.boardId,
    req.user!.userId
  );

  if (!columns) {
    sendError(res, 404, {
      code: "NOT_FOUND",
      message: "Board not found",
    });
    return;
  }

  res.json({ columns });
}

export async function createBoardColumn(req: Request, res: Response) {
  const result = createColumnSchema.safeParse(req.body);

  if (!result.success) {
    sendError(res, 400, {
      code: "BAD_REQUEST",
      message: "Invalid payload",
      details: formatZodError(result.error),
    });
    return;
  }

  const data = await columnService.createColumn(
    req.params.boardId,
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

  res.status(201).json(data);
}

export async function deleteBoard(req: Request, res: Response) {
  const result = await boardService.deleteBoard(
    req.params.boardId,
    req.user!.userId
  );

  if (!result) {
    sendError(res, 404, {
      code: "NOT_FOUND",
      message: "Board not found",
    });
    return;
  }

  res.status(204).send();
}
