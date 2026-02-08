import db, { initDb } from "./src/db";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  //ensure schema exists
  initDb();

  //check if already seeded
  const row = db.prepare("SELECT COUNT(*) as c FROM boards").get() as {
    c: number;
  };

  if (row.c > 0) {
    console.log("DB already seeded");
    return;
  }

  //demo user
  const passwordHash = await bcrypt.hash("password", 10);

  db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)").run(
    "demo@demo.com",
    passwordHash,
  );

  //board
  const boardResult = db
    .prepare("INSERT INTO boards (name) VALUES (?)")
    .run("Team Board");

  const boardId = boardResult.lastInsertRowid as number;

  //columns
  db.prepare(
    `INSERT INTO columns (board_id, name, "order")
     VALUES (?, ?, ?)`,
  ).run(boardId, "Todo", 1);

  db.prepare(
    `INSERT INTO columns (board_id, name, "order")
     VALUES (?, ?, ?)`,
  ).run(boardId, "In Progress", 2);

  db.prepare(
    `INSERT INTO columns (board_id, name, "order")
     VALUES (?, ?, ?)`,
  ).run(boardId, "Done", 3);

  //fetch column IDs
  const getCol = db.prepare(
    "SELECT id FROM columns WHERE name = ? AND board_id = ?",
  );

  const todoCol = (getCol.get("Todo", boardId) as any).id;
  const inProgressCol = (getCol.get("In Progress", boardId) as any).id;
  const doneCol = (getCol.get("Done", boardId) as any).id;

  //tasks
  db.prepare(
    "INSERT INTO tasks (column_id, title, description) VALUES (?, ?, ?)",
  ).run(todoCol, "Setup project", "Initialize repo and tooling");

  db.prepare(
    "INSERT INTO tasks (column_id, title, description) VALUES (?, ?, ?)",
  ).run(inProgressCol, "Build API", "Create Express endpoints");

  db.prepare(
    "INSERT INTO tasks (column_id, title, description) VALUES (?, ?, ?)",
  ).run(doneCol, "Write docs", "Prepare README");

  console.log("Seed completed.");
}

seed().catch((err) => {
  console.error("Seed failed...", err);
  process.exit(1);
});
