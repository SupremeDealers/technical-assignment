import fs from "fs";
import Database from "better-sqlite3";
import path from "path";
import { runMigrations } from "./schema";
import { ensureDefaultBoard } from "./ensureDefaultBoard";

const dbPath = process.env.SQLITE_PATH ?? path.join(process.cwd(), "data", "boards.db");

export function getDb(): Database.Database {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const db = new Database(dbPath);
  db.pragma("foreign_keys = ON");
  runMigrations(db);
  return db;
}

// Singleton for app lifecycle (create in index and pass to routes)
let dbInstance: Database.Database | null = null;

export function initDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = getDb();
  }
  return dbInstance;
}

export function getDbInstance(): Database.Database {
  if (!dbInstance) {
    dbInstance = getDb();
  }
  return dbInstance;
}

/**
 * Clears all data from the database (FK-safe order) and re-creates the default board.
 * Used in tests so the suite can run continuously with a clean state.
 */
export function clearAllData(): void {
  const db = getDbInstance();
  db.exec("DELETE FROM comments");
  db.exec("DELETE FROM tasks");
  db.exec("DELETE FROM columns");
  db.exec("DELETE FROM boards");
  db.exec("DELETE FROM users");
  ensureDefaultBoard(db);
}
