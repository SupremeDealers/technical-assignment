import db from '../db/client';
import { ServiceError } from '../utils/errors';
import { createCommentSchema } from '../validation/comment.schema';
import { z } from 'zod';

const assertTaskOwned = (userId: number, taskId: number) => {
  const row: any = db
    .prepare(
      `
      SELECT t.id
      FROM tasks t
      JOIN columns c ON c.id = t.column_id
      JOIN boards b ON b.id = c.board_id
      WHERE t.id = ? AND b.owner_id = ?
      `,
    )
    .get(taskId, userId);

  if (!row) throw new ServiceError(404, 'NOT_FOUND', 'Task not found');
  return row;
};

export const getComments = (taskId: number, userId: number) => {
  assertTaskOwned(userId, taskId);

  return db
    .prepare(
      `
      SELECT c.*, u.email as user_email
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.task_id = ?
      ORDER BY c.created_at ASC
      `,
    )
    .all(taskId);
};

export const createComment = (
  taskId: number,
  userId: number,
  data: z.infer<typeof createCommentSchema>,
) => {
  assertTaskOwned(userId, taskId);

  const insert = db.prepare('INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)');
  const result = insert.run(taskId, userId, data.content);

  return db
    .prepare(
      `
      SELECT c.*, u.email as user_email
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
      `,
    )
    .get(result.lastInsertRowid);
};