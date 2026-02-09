import Database from "better-sqlite3";
import { config } from "./config";
import { mkdirSync, existsSync } from "fs";
import { dirname } from "path";

const dbDir = dirname(config.dbPath);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(config.dbPath);

db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS boards (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS board_members (
    board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    PRIMARY KEY (board_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS columns (
    id TEXT PRIMARY KEY,
    board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    max_tasks INTEGER DEFAULT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    column_id TEXT NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
    position INTEGER NOT NULL DEFAULT 0,
    assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    due_date TEXT DEFAULT NULL,
    labels TEXT DEFAULT NULL,
    estimated_hours REAL DEFAULT NULL,
    is_archived INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  -- Activity Log Table
  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'moved', 'commented', 'assigned', 'completed', 'archived')),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('task', 'column', 'board', 'comment')),
    entity_name TEXT NOT NULL,
    details TEXT,
    metadata TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Checklist Items Table
  CREATE TABLE IF NOT EXISTS checklist_items (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_completed INTEGER DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  -- Time Entries Table
  CREATE TABLE IF NOT EXISTS time_entries (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description TEXT,
    started_at TEXT NOT NULL,
    ended_at TEXT,
    duration_minutes INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Attachments Table
  CREATE TABLE IF NOT EXISTS attachments (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Notifications Table
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('task_assigned', 'task_completed', 'comment_added', 'due_date_reminder', 'mentioned')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Task Templates Table
  CREATE TABLE IF NOT EXISTS task_templates (
    id TEXT PRIMARY KEY,
    board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    labels TEXT,
    checklist_items TEXT,
    estimated_hours REAL,
    created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_column_id ON tasks(column_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
  CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
  CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
  CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_archived ON tasks(is_archived);
  CREATE INDEX IF NOT EXISTS idx_comments_task_id ON comments(task_id);
  CREATE INDEX IF NOT EXISTS idx_columns_board_id ON columns(board_id);
  CREATE INDEX IF NOT EXISTS idx_board_members_user_id ON board_members(user_id);
  CREATE INDEX IF NOT EXISTS idx_activities_board_id ON activities(board_id);
  CREATE INDEX IF NOT EXISTS idx_activities_task_id ON activities(task_id);
  CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
  CREATE INDEX IF NOT EXISTS idx_checklist_items_task_id ON checklist_items(task_id);
  CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
  CREATE INDEX IF NOT EXISTS idx_attachments_task_id ON attachments(task_id);
  CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
  CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
  CREATE INDEX IF NOT EXISTS idx_task_templates_board_id ON task_templates(board_id);
`);

export default db;
