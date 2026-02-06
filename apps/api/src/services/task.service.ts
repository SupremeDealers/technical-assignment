
import db from '../db/client';
import { ServiceError } from '../utils/errors';
import { createTaskSchema, updateTaskSchema } from '../validation/task.schema';
import { z } from 'zod';

export const getBoard = (userId: number) => {
  const board: any = db.prepare('SELECT * FROM boards WHERE owner_id = ?').get(userId);
  if (!board) throw new ServiceError(404, 'NOT_FOUND', 'Board not found');
  
  const columns: any[] = db.prepare('SELECT * FROM columns WHERE board_id = ? ORDER BY "order" ASC').all(board.id);
  return { ...board, columns };
};

export const getTasks = (columnId: number) => {
  return db.prepare('SELECT * FROM tasks WHERE column_id = ? ORDER BY "order" ASC').all(columnId);
};

export const createTask = (columnId: number, data: z.infer<typeof createTaskSchema>) => {
  const { title, description, priority } = data;
  
  const maxOrder: any = db.prepare('SELECT MAX("order") as max FROM tasks WHERE column_id = ?').get(columnId);
  const newOrder = (maxOrder.max || 0) + 1;

  const insert = db.prepare('INSERT INTO tasks (column_id, title, description, priority, "order") VALUES (?, ?, ?, ?, ?)');
  const result = insert.run(columnId, title, description, priority, newOrder);
  
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
};

export const updateTask = (taskId: number, data: z.infer<typeof updateTaskSchema>) => {
  const { title, description, priority, columnId, order } = data;
  const updates: string[] = [];
  const values: any[] = [];

  if (title !== undefined) { updates.push('title = ?'); values.push(title); }
  if (description !== undefined) { updates.push('description = ?'); values.push(description); }
  if (priority !== undefined) { updates.push('priority = ?'); values.push(priority); }
  if (columnId !== undefined) { updates.push('column_id = ?'); values.push(columnId); }
  if (order !== undefined) { updates.push('"order" = ?'); values.push(order); }

if (updates.length === 0) return db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);

  values.push(taskId);
  db.prepare(`UPDATE tasks SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
  
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
};

export const deleteTask = (taskId: number) => {
  db.prepare('DELETE FROM comments WHERE task_id = ?').run(taskId);
  db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
};