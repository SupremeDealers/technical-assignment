import { Request, Response } from 'express';
import { db } from '../db';
import { tasks, columns } from '../db/schema';
import { eq, and, like, desc, asc, sql } from 'drizzle-orm';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from '../request_validations';

/*
* Validate the query params
* Sort based on priority or created_at
* on sorted data added the pagination logic
*/
export const getTasksByColumn = catchAsync(async (req: Request, res: Response) => {
  const { columnId } = req.params;
  
  const { value, error } = taskQuerySchema.validate(req.query);
  if (error) throw error;

  const { search, page, limit, sort } = value;
  const offset = (page - 1) * limit;

  let conditions = eq(tasks.columnId, columnId);//where clause

  if (search) {
    conditions = and(conditions, like(tasks.title, `%${search}%`)) as any;
  }

  // Build Sort Clause
  // Note: Simple sort. For specific priority order (High->Low), we'd need a raw SQL case statement.
  // Here we default to createdAt DESC (newest first) or Priority ASC (High/Low/Medium alphabetic fallback)
  const orderBy = sort === 'priority' 
    ? asc(tasks.priority) 
    : desc(tasks.createdAt);

  // Execute Query
  const results = await db
    .select()
    .from(tasks)
    .where(conditions)
    .limit(limit)
    .offset(offset)
    .orderBy(orderBy);

  //get Total Count (for pagination UI)
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(tasks)
    .where(conditions);

  res.json({
    data: results,
    meta: {
      page,
      limit,
      total: countResult.count,
      totalPages: Math.ceil(countResult.count / limit),
    },
  });
});


export const createTask = catchAsync(async (req: Request, res: Response) => {
  const { columnId } = req.params;
  const { error, value } = createTaskSchema.validate(req.body);
  if (error) throw error;

  const column = await db.select().from(columns).where(eq(columns.id, columnId)).get();
  if (!column) throw new AppError(404, 'NOT_FOUND', 'Column not found');

  const [newTask] = await db.insert(tasks).values({
    columnId,
    title: value.title,
    description: value.description,
    priority: value.priority,
  }).returning();

  res.status(201).json(newTask);
});

export const updateTask = catchAsync(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { error, value } = updateTaskSchema.validate(req.body);
  if (error) throw error;

  const [updatedTask] = await db
    .update(tasks)
    .set({
      ...value,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(tasks.id, taskId))
    .returning();
  if (!updatedTask) throw new AppError(404, 'NOT_FOUND', 'Task not found');

  res.json(updatedTask);
});

export const deleteTask = catchAsync(async (req: Request, res: Response) => {
  const { taskId } = req.params;

  const result = await db.delete(tasks).where(eq(tasks.id, taskId));
  if (!result.changes) throw new AppError(404, 'NOT_FOUND', 'Task not found');

  res.status(204).send();
});