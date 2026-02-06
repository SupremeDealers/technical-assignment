import { Request, Response } from "express";
import {
  getColumnsByBoard,
  createColumn,
  updateColumn,
  deleteColumn,
} from "./columns.service";
import { createColumnSchema, updateColumnSchema } from "./columns.schema";

export const getColumns = async (req: Request, res: Response) => {
  const { boardId } = req.params;
  const userId = req.user!.id;

  const columns = await getColumnsByBoard(boardId, userId);
  res.json(columns);
};

export const postColumn = async (req: Request, res: Response) => {
  const { boardId } = req.params;
  const userId = req.user!.id;

  const data = createColumnSchema.parse(req.body);
  const column = await createColumn(boardId, data.name, userId);

  res.status(201).json(column);
};

export const patchColumn = async (req: Request, res: Response) => {
  const { boardId, columnId } = req.params;
  const userId = req.user!.id;

  const data = updateColumnSchema.parse(req.body);
  const column = await updateColumn(columnId, boardId, userId, data);

  res.json(column);
};

export const deleteColumnHandler = async (req: Request, res: Response) => {
  const { boardId, columnId } = req.params;
  const userId = req.user!.id;

  await deleteColumn(columnId, boardId, userId);
  res.status(204).send();
};
