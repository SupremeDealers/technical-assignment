import { Request, Response } from 'express';
import { db } from '../db';
import { boards, columns, tasks } from '../db/schema';
import { eq, sql, asc } from 'drizzle-orm';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

export const getAllBoards = catchAsync(async (req: Request, res: Response) => {
  const allBoards = await db.select().from(boards).orderBy(asc(boards.createdAt));
  res.json(allBoards);
});

export const getBoardById = catchAsync(async (req: Request, res: Response) => {
  const { boardId } = req.params;

  const board = await db.select().from(boards).where(eq(boards.id, boardId)).get();
  if (!board) {
    throw new AppError(404, 'NOT_FOUND', 'Board not found');
  }
  res.json(board);
});

export const getBoardColumns = catchAsync(async (req: Request, res: Response) => {
  const { boardId } = req.params;

  const boardExists = await db.select().from(boards).where(eq(boards.id, boardId)).get();
  if (!boardExists) {
    throw new AppError(404, 'NOT_FOUND', 'Board not found');
  }

  const result = await db
    .select({
      id: columns.id,
      boardId: columns.boardId,
      name: columns.name,
      createdAt: columns.createdAt,
      taskCount: sql<number>`count(${tasks.id})`,
    })
    .from(columns)
    .leftJoin(tasks, eq(columns.id, tasks.columnId))
    .where(eq(columns.boardId, boardId))
    .groupBy(columns.id)
    .orderBy(asc(columns.createdAt));

  res.json(result);
});