import { getDbInstance } from "../db/index";
import type { Column } from "../types/entities";

export function findByBoardId(boardId: number): Column[] {
  const db = getDbInstance();
  const rows = db
    .prepare(
      `SELECT c.id, c.board_id as boardId, c.title, c.position, c.created_at as createdAt,
              (SELECT COUNT(*) FROM tasks t WHERE t.column_id = c.id) as taskCount
       FROM columns c
       WHERE c.board_id = ?
       ORDER BY c.position, c.id`
    )
    .all(boardId) as Column[];
  return rows;
}

export function findById(id: number): Column | null {
  const db = getDbInstance();
  const row = db
    .prepare(
      "SELECT id, board_id as boardId, title, position, created_at as createdAt FROM columns WHERE id = ?"
    )
    .get(id) as Omit<Column, "taskCount"> | undefined;
  return row ?? null;
}

export function getNextPosition(boardId: number): number {
  const db = getDbInstance();
  const row = db
    .prepare("SELECT COALESCE(MAX(position), -1) + 1 as next FROM columns WHERE board_id = ?")
    .get(boardId) as { next: number };
  return row.next;
}

export function create(data: { boardId: number; title: string; position: number }): Column {
  const db = getDbInstance();
  const result = db
    .prepare("INSERT INTO columns (board_id, title, position) VALUES (?, ?, ?)")
    .run(data.boardId, data.title, data.position);
  const column = db
    .prepare(
      "SELECT id, board_id as boardId, title, position, created_at as createdAt FROM columns WHERE id = ?"
    )
    .get(result.lastInsertRowid) as Column;
  return column;
}

export function update(id: number, data: { title?: string; position?: number }): Column | null {
  const db = getDbInstance();
  const existing = findById(id);
  if (!existing) return null;
  const title = data.title ?? existing.title;
  const position = data.position ?? existing.position;
  db.prepare("UPDATE columns SET title = ?, position = ? WHERE id = ?").run(title, position, id);
  return findById(id);
}

export function deleteById(id: number): boolean {
  const db = getDbInstance();
  const result = db.prepare("DELETE FROM columns WHERE id = ?").run(id);
  return result.changes > 0;
}
