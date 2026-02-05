import { getDbInstance } from "../db/index";
import type { Task, TaskListResult } from "../types/entities";

export type TaskQuery = {
  columnId: number;
  search: string;
  page: number;
  limit: number;
  sort: "createdAt" | "priority";
};

export function findByColumnId(query: TaskQuery): TaskListResult {
  const db = getDbInstance();
  const { columnId, search, page, limit, sort } = query;
  const offset = (page - 1) * limit;
  const orderClause = sort === "priority" ? "t.priority DESC, t.created_at DESC" : "t.created_at DESC";

  let tasks: Task[];
  let total: number;

  if (search.trim()) {
    const pattern = `%${search.trim()}%`;
    tasks = db
      .prepare(
        `SELECT t.id, t.column_id as columnId, t.title, t.description, t.priority, t.position,
                t.created_at as createdAt, t.updated_at as updatedAt,
                u.name as creatorName
         FROM tasks t
         LEFT JOIN users u ON t.created_by = u.id
         WHERE t.column_id = ? AND (t.title LIKE ? OR t.description LIKE ?)
         ORDER BY ${orderClause}
         LIMIT ? OFFSET ?`
      )
      .all(columnId, pattern, pattern, limit, offset) as Task[];
    const row = db
      .prepare(
        "SELECT COUNT(*) as c FROM tasks WHERE column_id = ? AND (title LIKE ? OR description LIKE ?)"
      )
      .get(columnId, pattern, pattern) as { c: number };
    total = row.c;
  } else {
    tasks = db
      .prepare(
        `SELECT t.id, t.column_id as columnId, t.title, t.description, t.priority, t.position,
                t.created_at as createdAt, t.updated_at as updatedAt,
                u.name as creatorName
         FROM tasks t
         LEFT JOIN users u ON t.created_by = u.id
         WHERE t.column_id = ?
         ORDER BY ${orderClause}
         LIMIT ? OFFSET ?`
      )
      .all(columnId, limit, offset) as Task[];
    const row = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE column_id = ?").get(columnId) as { c: number };
    total = row.c;
  }

  return { tasks, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export function findById(id: number): Task | null {
  const db = getDbInstance();
  const row = db
    .prepare(
      `SELECT t.id, t.column_id as columnId, t.title, t.description, t.priority, t.position,
              t.created_at as createdAt, t.updated_at as updatedAt, u.name as creatorName
       FROM tasks t
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.id = ?`
    )
    .get(id) as Task | undefined;
  return row ?? null;
}

export function getNextPosition(columnId: number): number {
  const db = getDbInstance();
  const row = db
    .prepare("SELECT COALESCE(MAX(position), -1) + 1 as next FROM tasks WHERE column_id = ?")
    .get(columnId) as { next: number };
  return row.next;
}

export function create(data: {
  columnId: number;
  title: string;
  description: string | null;
  priority: string;
  createdBy: number | null;
}): Task {
  const db = getDbInstance();
  const position = getNextPosition(data.columnId);
  db.prepare(
    "INSERT INTO tasks (column_id, title, description, priority, position, created_by) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(data.columnId, data.title, data.description, data.priority, position, data.createdBy);
  const task = db
    .prepare(
      `SELECT t.id, t.column_id as columnId, t.title, t.description, t.priority, t.position,
              t.created_at as createdAt, t.updated_at as updatedAt, u.name as creatorName
       FROM tasks t
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.column_id = ? ORDER BY t.id DESC LIMIT 1`
    )
    .get(data.columnId) as Task;
  return task;
}

export function update(
  id: number,
  data: { title?: string; description?: string | null; priority?: string; columnId?: number }
): Task | null {
  const db = getDbInstance();
  const existing = findById(id);
  if (!existing) return null;

  const title = data.title ?? existing.title;
  const description = data.description !== undefined ? data.description : existing.description;
  const priority = data.priority ?? existing.priority;
  const columnId = data.columnId ?? existing.columnId;

  db.prepare(
    "UPDATE tasks SET title = ?, description = ?, priority = ?, column_id = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(title, description, priority, columnId, id);

  return findById(id);
}

export function deleteById(id: number): boolean {
  const db = getDbInstance();
  const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  return result.changes > 0;
}
