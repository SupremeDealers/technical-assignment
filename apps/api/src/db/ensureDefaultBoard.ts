import type Database from "better-sqlite3";

const DEFAULT_BOARD_ID = 1;
const DEFAULT_BOARD_TITLE = "Team Board";

/**
 * Ensures a default board with id 1 exists. Called on server start.
 * If the board is missing (e.g. fresh DB or board was deleted), creates it.
 */
export function ensureDefaultBoard(db: Database.Database): void {
  const existing = db.prepare("SELECT id FROM boards WHERE id = ?").get(DEFAULT_BOARD_ID);
  if (existing) return;

  db.prepare("INSERT INTO boards (id, title) VALUES (?, ?)").run(DEFAULT_BOARD_ID, DEFAULT_BOARD_TITLE);
  console.log(`[api] default board (id=${DEFAULT_BOARD_ID}) created`);
}
