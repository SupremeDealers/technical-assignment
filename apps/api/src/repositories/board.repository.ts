import { getDbInstance } from "../db/index";
import type { Board } from "../types/entities";

export function findById(id: number): Board | null {
  const db = getDbInstance();
  const row = db
    .prepare("SELECT id, title, created_at as createdAt FROM boards WHERE id = ?")
    .get(id) as Board | undefined;
  return row ?? null;
}

export function exists(id: number): boolean {
  const db = getDbInstance();
  const row = db.prepare("SELECT id FROM boards WHERE id = ?").get(id);
  return !!row;
}
