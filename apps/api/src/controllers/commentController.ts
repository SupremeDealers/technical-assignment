import { Request, Response } from 'express';
import { db } from '../db';
import { comments, users, tasks } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { createCommentSchema } from '../request_validations';

// 1. GET Comments for a Task
export const getTaskComments = catchAsync(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  
  const task = await db.select().from(tasks).where(eq(tasks.id, taskId)).get();
  if (!task) throw new AppError(404, 'NOT_FOUND', 'Task not found');

  const results = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      },
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.taskId, taskId))
    .orderBy(desc(comments.createdAt));

  res.json(results);
});

export const createComment = catchAsync(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { error, value } = createCommentSchema.validate(req.body);
  if (error) throw error;

  const task = await db.select().from(tasks).where(eq(tasks.id, taskId)).get();
  if (!task) throw new AppError(404, 'NOT_FOUND', 'Task not found');

  const [newComment] = await db.insert(comments).values({
    taskId,
    userId: req.user!.userId,
    content: value.content,
  }).returning();

  const commentWithUser = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.id, newComment.id))
    .get();

  res.status(201).json(commentWithUser);
});