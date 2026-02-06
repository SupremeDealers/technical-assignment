import db from '../db/client';
import { ServiceError } from '../utils/errors';
import { createCommentSchema } from '../validation/comment.schema';
import { z } from 'zod';

export const getComments = (taskId: number) => {
  // Verify task exists
  const task = db.prepare('SELECT id FROM tasks WHERE id = ?').get(taskId);
  if (!task) {
    throw new ServiceError(404, 'NOT_FOUND', 'Task not found');
  }

  // Fetch comments with user info
  return db.prepare(`
    SELECT c.*, u.email as user_email 
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.task_id = ?
    ORDER BY c.created_at ASC
  `).all(taskId);
};

export const createComment = (taskId: number, userId: number, data: z.infer<typeof createCommentSchema>) => {
  const { content } = data;

  // Verify task exists
  const task = db.prepare('SELECT id FROM tasks WHERE id = ?').get(taskId);
  if (!task) {
    throw new ServiceError(404, 'NOT_FOUND', 'Task not found');
  }

  const insert = db.prepare('INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)');
  const result = insert.run(taskId, userId, content);

  // Return the created comment with user email
  return db.prepare(`
    SELECT c.*, u.email as user_email 
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).get(result.lastInsertRowid);
};