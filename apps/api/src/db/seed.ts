import { db, initDb } from "./db";
import bcrypt from "bcryptjs";

export async function seed() {
  console.log("[seed] Starting database seed...");
  
  // Initialize database schema
  initDb();

  // Clear existing data
  db.exec(`
    DELETE FROM comments;
    DELETE FROM tasks;
    DELETE FROM columns;
    DELETE FROM boards;
    DELETE FROM users;
  `);

  // Create demo users
  const password = await bcrypt.hash("password123", 10);
  
  const insertUser = db.prepare(
    "INSERT INTO users (email, password, name) VALUES (?, ?, ?)"
  );
  
  insertUser.run("alice@example.com", password, "Alice Johnson");
  insertUser.run("bob@example.com", password, "Bob Smith");
  insertUser.run("charlie@example.com", password, "Charlie Davis");

  const users = db.prepare("SELECT * FROM users").all() as Array<{ id: number }>;
  const alice = users[0];
  const bob = users[1];
  const charlie = users[2];

  // Create a demo board
  const insertBoard = db.prepare(
    "INSERT INTO boards (name, description, owner_id) VALUES (?, ?, ?)"
  );
  
  insertBoard.run(
    "Project Alpha",
    "Main development board for Project Alpha",
    alice.id
  );

  const boards = db.prepare("SELECT * FROM boards").all() as Array<{ id: number }>;
  const board = boards[0];

  // Create columns
  const insertColumn = db.prepare(
    "INSERT INTO columns (board_id, name, position) VALUES (?, ?, ?)"
  );
  
  insertColumn.run(board.id, "To Do", 0);
  insertColumn.run(board.id, "In Progress", 1);
  insertColumn.run(board.id, "Review", 2);
  insertColumn.run(board.id, "Done", 3);

  const columns = db.prepare("SELECT * FROM columns WHERE board_id = ? ORDER BY position").all(board.id) as Array<{ id: number }>;
  const [todoCol, inProgressCol, reviewCol, doneCol] = columns;

  // Create tasks
  const insertTask = db.prepare(
    "INSERT INTO tasks (column_id, title, description, priority, position) VALUES (?, ?, ?, ?, ?)"
  );

  // To Do tasks
  insertTask.run(
    todoCol.id,
    "Setup authentication system",
    "Implement JWT-based authentication with login and register endpoints",
    "high",
    0
  );
  insertTask.run(
    todoCol.id,
    "Design database schema",
    "Create tables for users, boards, columns, tasks, and comments",
    "high",
    1
  );
  insertTask.run(
    todoCol.id,
    "Write API documentation",
    "Document all REST endpoints with examples",
    "medium",
    2
  );

  // In Progress tasks
  insertTask.run(
    inProgressCol.id,
    "Implement task CRUD operations",
    "Create endpoints for creating, reading, updating, and deleting tasks",
    "high",
    0
  );
  insertTask.run(
    inProgressCol.id,
    "Add search and pagination",
    "Implement filtering, search, and pagination for task lists",
    "medium",
    1
  );

  // Review tasks
  insertTask.run(
    reviewCol.id,
    "Build React components",
    "Create reusable components for task cards and board columns",
    "medium",
    0
  );
  insertTask.run(
    reviewCol.id,
    "Add drag-and-drop functionality",
    "Implement drag-and-drop for moving tasks between columns",
    "low",
    1
  );

  // Done tasks
  insertTask.run(
    doneCol.id,
    "Setup project structure",
    "Initialize monorepo with API and web applications",
    "high",
    0
  );
  insertTask.run(
    doneCol.id,
    "Configure ESLint and TypeScript",
    "Setup linting and type checking for both frontend and backend",
    "medium",
    1
  );

  // Create comments
  const tasks = db.prepare("SELECT * FROM tasks").all() as Array<{ id: number }>;
  
  const insertComment = db.prepare(
    "INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)"
  );

  insertComment.run(
    tasks[0].id,
    bob.id,
    "I can start working on this tomorrow. Should we use JWT or session-based auth?"
  );
  insertComment.run(
    tasks[0].id,
    alice.id,
    "JWT would be better for our use case. Let's go with that."
  );
  insertComment.run(
    tasks[3].id,
    charlie.id,
    "Making good progress on this. Should have it ready by EOD."
  );
  insertComment.run(
    tasks[7].id,
    alice.id,
    "Great work team! The foundation is looking solid."
  );

  console.log("[seed] Database seeded successfully!");
  console.log("[seed] Demo users:");
  console.log("  - alice@example.com / password123");
  console.log("  - bob@example.com / password123");
  console.log("  - charlie@example.com / password123");
}

// Run seed when this file is executed
seed()
  .then(() => {
    db.close();
    console.log("[seed] Done!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("[seed] Error:", err);
    db.close();
    process.exit(1);
  });
