import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import db from "./db";
import { config } from "./config";

async function seed() {
  console.log("🌱 Seeding database...");

  const now = new Date().toISOString();

  db.exec(`
    DELETE FROM comments;
    DELETE FROM tasks;
    DELETE FROM columns;
    DELETE FROM board_members;
    DELETE FROM boards;
    DELETE FROM users;
  `);

  const users = [
    { id: uuidv4(), email: "alice@example.com", name: "Alice Johnson", password: "password123" },
    { id: uuidv4(), email: "bob@example.com", name: "Bob Smith", password: "password123" },
    { id: uuidv4(), email: "charlie@example.com", name: "Charlie Brown", password: "password123" },
  ];

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, config.bcryptRounds);
    db.prepare(
      `INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(user.id, user.email, passwordHash, user.name, now, now);
    console.log(`  ✓ Created user: ${user.email}`);
  }

  const boardId = uuidv4();
  db.prepare(
    `INSERT INTO boards (id, name, description, owner_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(boardId, "Project Alpha", "Main project board for tracking features and bugs", users[0].id, now, now);
  console.log(`  ✓ Created board: Project Alpha`);

  db.prepare("INSERT INTO board_members (board_id, user_id, role) VALUES (?, ?, ?)").run(
    boardId,
    users[1].id,
    "member"
  );
  db.prepare("INSERT INTO board_members (board_id, user_id, role) VALUES (?, ?, ?)").run(
    boardId,
    users[2].id,
    "member"
  );

  const columns = [
    { id: uuidv4(), name: "Backlog", position: 0 },
    { id: uuidv4(), name: "To Do", position: 1 },
    { id: uuidv4(), name: "In Progress", position: 2 },
    { id: uuidv4(), name: "Review", position: 3 },
    { id: uuidv4(), name: "Done", position: 4 },
  ];

  for (const col of columns) {
    db.prepare(
      `INSERT INTO columns (id, board_id, name, position, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(col.id, boardId, col.name, col.position, now, now);
    console.log(`  ✓ Created column: ${col.name}`);
  }

  const tasks = [
    {
      id: uuidv4(),
      column_id: columns[0].id,
      title: "Research competitor analysis",
      description: "Analyze top 5 competitors and document their key features",
      priority: "low",
      position: 0,
      assignee_id: null,
      created_by: users[0].id,
    },
    {
      id: uuidv4(),
      column_id: columns[0].id,
      title: "Plan Q2 roadmap",
      description: "Create quarterly roadmap with milestones and deliverables",
      priority: "medium",
      position: 1,
      assignee_id: users[0].id,
      created_by: users[0].id,
    },
    {
      id: uuidv4(),
      column_id: columns[1].id,
      title: "Design new landing page",
      description: "Create mockups for the new marketing landing page. Include mobile and desktop variants.",
      priority: "high",
      position: 0,
      assignee_id: users[1].id,
      created_by: users[0].id,
    },
    {
      id: uuidv4(),
      column_id: columns[1].id,
      title: "Set up CI/CD pipeline",
      description: "Configure GitHub Actions for automated testing and deployment",
      priority: "medium",
      position: 1,
      assignee_id: users[2].id,
      created_by: users[0].id,
    },
    {
      id: uuidv4(),
      column_id: columns[2].id,
      title: "Implement user authentication",
      description: "Add login, register, and JWT token-based authentication to the API",
      priority: "high",
      position: 0,
      assignee_id: users[0].id,
      created_by: users[0].id,
    },
    {
      id: uuidv4(),
      column_id: columns[2].id,
      title: "Build task management UI",
      description: "Create React components for the kanban board with drag and drop support",
      priority: "high",
      position: 1,
      assignee_id: users[1].id,
      created_by: users[0].id,
    },
    {
      id: uuidv4(),
      column_id: columns[3].id,
      title: "API documentation",
      description: "Write OpenAPI/Swagger documentation for all endpoints",
      priority: "medium",
      position: 0,
      assignee_id: users[2].id,
      created_by: users[1].id,
    },
    {
      id: uuidv4(),
      column_id: columns[4].id,
      title: "Project setup",
      description: "Initialize monorepo with API and web app structure",
      priority: "high",
      position: 0,
      assignee_id: users[0].id,
      created_by: users[0].id,
    },
    {
      id: uuidv4(),
      column_id: columns[4].id,
      title: "Database schema design",
      description: "Design and implement SQLite schema for users, boards, columns, tasks, and comments",
      priority: "high",
      position: 1,
      assignee_id: users[0].id,
      created_by: users[0].id,
    },
  ];

  for (const task of tasks) {
    db.prepare(
      `INSERT INTO tasks (id, column_id, title, description, priority, position, assignee_id, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      task.id,
      task.column_id,
      task.title,
      task.description,
      task.priority,
      task.position,
      task.assignee_id,
      task.created_by,
      now,
      now
    );
  }
  console.log(`  ✓ Created ${tasks.length} tasks`);

  const comments = [
    {
      id: uuidv4(),
      task_id: tasks[4].id,
      user_id: users[1].id,
      content: "Should we use JWT or session cookies? I think JWT would be better for the mobile app in the future.",
    },
    {
      id: uuidv4(),
      task_id: tasks[4].id,
      user_id: users[0].id,
      content: "Good point! Let's go with JWT. I'll add refresh tokens as a nice-to-have.",
    },
    {
      id: uuidv4(),
      task_id: tasks[4].id,
      user_id: users[2].id,
      content: "Don't forget to hash the passwords with bcrypt!",
    },
    {
      id: uuidv4(),
      task_id: tasks[5].id,
      user_id: users[0].id,
      content: "Let's use react-beautiful-dnd for the drag and drop. It has great accessibility support.",
    },
    {
      id: uuidv4(),
      task_id: tasks[5].id,
      user_id: users[1].id,
      content: "I'll start with the basic card layout today and add DnD tomorrow.",
    },
    {
      id: uuidv4(),
      task_id: tasks[2].id,
      user_id: users[0].id,
      content: "Check out the Figma file I shared. Let me know if you need any clarification on the designs.",
    },
  ];

  for (const comment of comments) {
    db.prepare(
      `INSERT INTO comments (id, task_id, user_id, content, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(comment.id, comment.task_id, comment.user_id, comment.content, now, now);
  }
  console.log(`  ✓ Created ${comments.length} comments`);

  console.log("\n✅ Seeding complete!");
  console.log("\n📋 Demo credentials:");
  console.log("   Email: alice@example.com");
  console.log("   Password: password123");
  console.log("\n   (Also available: bob@example.com, charlie@example.com with same password)");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
