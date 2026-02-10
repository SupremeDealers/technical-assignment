import db from "./db.js";
import bcrypt from "bcryptjs";

/**
 * Seed script — creates demo users, a board, columns, tasks, and comments.
 * Run with: npx tsx src/seed.ts
 */

console.log("🌱 Seeding database...");

// Clear existing data
db.exec("DELETE FROM comments");
db.exec("DELETE FROM tasks");
db.exec("DELETE FROM columns");
db.exec("DELETE FROM boards");
db.exec("DELETE FROM users");

// Reset auto-increment
db.exec("DELETE FROM sqlite_sequence");

// ── Users ────────────────────────────────────────────────────────────
const hash = (pw: string) => bcrypt.hashSync(pw, 10);

const insertUser = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
insertUser.run("alice", "alice@demo.com", hash("password123"));
insertUser.run("bob", "bob@demo.com", hash("password123"));
insertUser.run("charlie", "charlie@demo.com", hash("password123"));

console.log("  ✓ Created 3 users (alice, bob, charlie — password: password123)");

// ── Board ────────────────────────────────────────────────────────────
const boardResult = db.prepare("INSERT INTO boards (name, owner_id) VALUES (?, ?)").run("Sprint Board", 1);
const boardId = boardResult.lastInsertRowid;
console.log(`  ✓ Created board "Sprint Board" (id: ${boardId})`);

// ── Columns ──────────────────────────────────────────────────────────
const insertCol = db.prepare("INSERT INTO columns (board_id, name, position) VALUES (?, ?, ?)");
const col1 = insertCol.run(boardId, "Backlog", 0);
const col2 = insertCol.run(boardId, "In Progress", 1);
const col3 = insertCol.run(boardId, "Review", 2);
const col4 = insertCol.run(boardId, "Done", 3);

console.log("  ✓ Created 4 columns (Backlog, In Progress, Review, Done)");

// ── Tasks ────────────────────────────────────────────────────────────
const insertTask = db.prepare(
  "INSERT INTO tasks (column_id, title, description, priority, assignee_id, position) VALUES (?, ?, ?, ?, ?, ?)"
);

// Backlog tasks
insertTask.run(col1.lastInsertRowid, "Setup CI/CD pipeline", "Configure GitHub Actions for automated testing and deployment", "high", 1, 0);
insertTask.run(col1.lastInsertRowid, "Design database schema", "Create ERD and migration scripts for the project", "medium", 2, 1);
insertTask.run(col1.lastInsertRowid, "Write API docs", "Document all REST endpoints with examples", "low", null, 2);
insertTask.run(col1.lastInsertRowid, "Add search functionality", "Implement full-text search across tasks", "medium", 3, 3);

// In Progress tasks
insertTask.run(col2.lastInsertRowid, "Build auth system", "JWT-based authentication with register and login", "high", 1, 0);
insertTask.run(col2.lastInsertRowid, "Create board UI", "Kanban-style board with drag and drop", "high", 2, 1);
insertTask.run(col2.lastInsertRowid, "Integrate TanStack Query", "Setup data fetching and cache invalidation", "medium", 1, 2);

// Review tasks
insertTask.run(col3.lastInsertRowid, "Add form validation", "Client-side validation with proper error messages", "medium", 3, 0);
insertTask.run(col3.lastInsertRowid, "Responsive design", "Ensure the app works on mobile and tablet", "low", 2, 1);

// Done tasks
insertTask.run(col4.lastInsertRowid, "Project scaffolding", "Setup monorepo with API and web apps", "high", 1, 0);
insertTask.run(col4.lastInsertRowid, "Install dependencies", "Add all required packages for the project", "low", 1, 1);

console.log("  ✓ Created 11 tasks across all columns");

// ── Comments ─────────────────────────────────────────────────────────
const insertComment = db.prepare("INSERT INTO comments (task_id, user_id, body) VALUES (?, ?, ?)");

insertComment.run(5, 1, "Started working on the auth module. Using bcryptjs for hashing and JWT for tokens.");
insertComment.run(5, 2, "Don't forget to add token refresh logic later.");
insertComment.run(5, 3, "Should we use HTTP-only cookies instead of localStorage for the token?");

insertComment.run(6, 2, "Using react-beautiful-dnd for drag and drop. It handles accessibility out of the box.");
insertComment.run(6, 1, "Looks great! Make sure we handle optimistic updates for the column moves.");

insertComment.run(8, 3, "I've added Zod validation on both frontend and backend.");
insertComment.run(8, 1, "Nice! Can we share the schemas between API and web?");

insertComment.run(10, 1, "All set — monorepo is configured with pnpm workspaces.");

console.log("  ✓ Created 8 comments");
console.log("\n✅ Seed complete!\n");
console.log("  Demo login:");
console.log("    Email: alice@demo.com");
console.log("    Password: password123\n");
