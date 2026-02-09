import { getDb, closeDb } from "./db/index";

const db = getDb();

console.log("Database Contents:");
console.log("==================\n");

const users = db.prepare("SELECT * FROM users").all();
console.log(`Users (${users.length}):`);
users.forEach((user: any) => {
  console.log(`  - ${user.name} (${user.email})`);
});

console.log("");

const boards = db.prepare("SELECT * FROM boards").all();
console.log(`Boards (${boards.length}):`);
boards.forEach((board: any) => {
  console.log(`  - ${board.title}`);
});

console.log("");

const columns = db.prepare("SELECT * FROM columns").all();
console.log(`Columns (${columns.length}):`);
columns.forEach((col: any) => {
  console.log(`  - ${col.title}`);
});

console.log("");

const tasks = db.prepare("SELECT * FROM tasks").all();
console.log(`Tasks (${tasks.length}):`);
tasks.forEach((task: any) => {
  console.log(`  - ${task.title}`);
});

console.log("");

const comments = db.prepare("SELECT * FROM comments").all();
console.log(`Comments (${comments.length}):`);

closeDb();
