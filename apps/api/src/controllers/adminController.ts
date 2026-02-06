import { Request, Response } from 'express';
import { db } from '../db';
import { boards, columns } from '../db/schema';
import { eq } from 'drizzle-orm';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { createBoardSchema, createColumnSchema } from '../request_validations';

//creation related controller
export const createBoard = catchAsync(async (req: Request, res: Response) => {
  const { error, value } = createBoardSchema.validate(req.body);
  if (error) throw error;

  const [newBoard] = await db.insert(boards).values({
    name: value.name,
  }).returning();

  res.status(201).json(newBoard);
});

export const createColumn = catchAsync(async (req: Request, res: Response) => {
  const { error, value } = createColumnSchema.validate(req.body);
  if (error) throw error;

  const board = await db.select().from(boards).where(eq(boards.id, value.boardId)).get();
  if (!board) throw new AppError(404, 'NOT_FOUND', 'Board not found');

  const [newColumn] = await db.insert(columns).values({
    boardId: value.boardId,
    name: value.name,
  }).returning();

  res.status(201).json(newColumn);
});

//Deletion related controllers
export const deleteBoard = catchAsync(async (req: Request, res: Response) => {
  const { boardId } = req.params;

  const result = await db.delete(boards).where(eq(boards.id, boardId));

  if (!result.changes) {
    throw new AppError(404, 'NOT_FOUND', 'Board not found');
  }

  res.status(200).json({success:true,message:"Board deleted successfully"});
});


export const deleteColumn = catchAsync(async (req: Request, res: Response) => {
  const { columnId } = req.params;
  const result = await db.delete(columns).where(eq(columns.id, columnId));

  if (!result.changes) {
    throw new AppError(404, 'NOT_FOUND', 'Column not found');
  }

  res.status(200).json({success:true,message:"Column deleted successfully"});
});