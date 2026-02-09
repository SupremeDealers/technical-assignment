import Database from "better-sqlite3";
import { initSchema } from "./schema";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file location (in the api directory, not src)
// Use in-memory database for tests
const DB_PATH =
  process.env.NODE_ENV === "test"
    ? ":memory:"
    : process.env.DB_PATH || path.join(process.cwd(), "database.sqlite");

let db: Database.Database | null = null;

/**
 * Get or create the database connection
 */
export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("foreign_keys = ON");
    initSchema(db);
    if (process.env.NODE_ENV !== "test") {
      console.log(`[db] SQLite database initialized at ${DB_PATH}`);
    }
  }
  return db;
}

/**
 * Close the database connection
 */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export { Database };
