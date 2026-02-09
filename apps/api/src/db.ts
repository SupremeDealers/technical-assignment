import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "../database.sqlite");

const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK(status IN ('todo', 'in-progress', 'done')) NOT NULL DEFAULT 'todo',
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

export default db;

export interface UserRow {
  id: string;
  username: string;
  password_hash: string;
}

export interface TaskRow {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  user_id: string;
  created_at: string;
}

export interface CommentRow {
  id: string;
  task_id: string;
  user_id: string;
  text: string;
  created_at: string;
  username?: string; // For joined queries
}
