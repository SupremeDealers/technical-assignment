/**
 * Seed script: creates demo board, columns, tasks, and users.
 * Run with: pnpm exec tsx src/seed.ts
 */
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { runMigrations } from "./db/schema";

const dbPath = process.env.SQLITE_PATH ?? path.join(process.cwd(), "data", "boards.db");

function seed() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const db = new Database(dbPath);
  db.pragma("foreign_keys = ON");
  runMigrations(db);

  const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get("demo@example.com");
  if (existingUser) {
    console.log("Seed already applied (demo user exists). Exiting.");
    db.close();
    return;
  }

  const saltRounds = 10;
  const demoHash = bcrypt.hashSync("demo1234", saltRounds);

  db.prepare("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)").run(
    "demo@example.com",
    demoHash,
    "Demo User"
  );
  db.prepare("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)").run(
    "alice@example.com",
    bcrypt.hashSync("alice1234", saltRounds),
    "Alice"
  );

  db.prepare("INSERT INTO boards (title) VALUES (?)").run("Team Board");
  const board = db.prepare("SELECT id FROM boards ORDER BY id DESC LIMIT 1").get() as { id: number };
  const boardId = board.id;

  const columnTitles = ["To Do", "In Progress", "Done"];
  const columnIds: number[] = [];
  for (let i = 0; i < columnTitles.length; i++) {
    db.prepare("INSERT INTO columns (board_id, title, position) VALUES (?, ?, ?)").run(
      boardId,
      columnTitles[i],
      i
    );
    const col = db.prepare("SELECT id FROM columns ORDER BY id DESC LIMIT 1").get() as { id: number };
    columnIds.push(col.id);
  }

  const [toDoId, inProgressId, doneId] = columnIds;
  const demoUser = db.prepare("SELECT id FROM users WHERE email = ?").get("demo@example.com") as { id: number };

  const taskRows = [
    { col: toDoId, title: "Welcome task", description: "Move me to In Progress!", priority: "medium" },
    { col: toDoId, title: "Review README", description: "Read the project README", priority: "high" },
    { col: inProgressId, title: "Implement API", description: "Build the backend", priority: "high" },
    { col: doneId, title: "Setup project", description: "Initial setup complete", priority: "low" },
  ];
  for (const t of taskRows) {
    db.prepare(
      "INSERT INTO tasks (column_id, title, description, priority, position, created_by) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(t.col, t.title, t.description, t.priority, 0, demoUser.id);
  }

  const firstTask = db.prepare("SELECT id FROM tasks WHERE title = ?").get("Welcome task") as { id: number };
  db.prepare("INSERT INTO comments (task_id, user_id, body) VALUES (?, ?, ?)").run(
    firstTask.id,
    demoUser.id,
    "This is a demo comment. Add more from the task details!"
  );

  db.close();
  console.log("Seed completed: demo board, columns, tasks, and users (demo@example.com / demo1234).");
}

seed();
