import { getDbInstance } from "../db/index";
import type { Comment } from "../types/entities";

export function findByTaskId(taskId: number): Comment[] {
  const db = getDbInstance();
  const rows = db
    .prepare(
      `SELECT c.id, c.task_id as taskId, c.user_id as userId, c.body, c.created_at as createdAt,
              u.name as authorName, u.email as authorEmail
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.task_id = ?
       ORDER BY c.created_at ASC`
    )
    .all(taskId) as Comment[];
  return rows;
}

export function create(data: { taskId: number; userId: number; body: string }): Comment {
  const db = getDbInstance();
  const result = db
    .prepare("INSERT INTO comments (task_id, user_id, body) VALUES (?, ?, ?)")
    .run(data.taskId, data.userId, data.body);
  const comment = db
    .prepare(
      `SELECT c.id, c.task_id as taskId, c.user_id as userId, c.body, c.created_at as createdAt,
              u.name as authorName, u.email as authorEmail
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.id = ?`
    )
    .get(result.lastInsertRowid) as Comment;
  return comment;
}
