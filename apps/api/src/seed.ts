import db from "./db";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  db.exec("DELETE FROM comments");
  db.exec("DELETE FROM tasks");
  db.exec("DELETE FROM users");

  const passwordHash = await bcrypt.hash("password123", 10);

  // Users
  const users = [
    { id: "u1", username: "alice", password_hash: passwordHash },
    { id: "u2", username: "bob", password_hash: passwordHash },
  ];

  const insertUser = db.prepare(
    "INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)",
  );
  for (const user of users) {
    insertUser.run(user.id, user.username, user.password_hash);
  }

  // Tasks
  const tasks = [
    {
      id: "t1",
      title: "Setup Project",
      description: "Initialize repo and basic structure",
      status: "done",
      user_id: "u1",
    },
    {
      id: "t2",
      title: "Implement Auth",
      description: "Add JWT and SQLite auth",
      status: "in-progress",
      user_id: "u1",
    },
    {
      id: "t3",
      title: "Design Board UI",
      description: "Create columns and cards",
      status: "todo",
      user_id: "u2",
    },
    {
      id: "t4",
      title: "Add Comments",
      description: "Allow users to discuss tasks",
      status: "todo",
      user_id: "u2",
    },
    {
      id: "t5",
      title: "Basic Accessibility",
      description: "Check contrast and aria labels",
      status: "todo",
      user_id: "u1",
    },
    {
      id: "t6",
      title: "Fix Build Pipeline",
      description: "Ensure CI/CD is working",
      status: "done",
      user_id: "u2",
    },
  ];

  const insertTask = db.prepare(
    "INSERT INTO tasks (id, title, description, status, user_id) VALUES (?, ?, ?, ?, ?)",
  );
  for (const task of tasks) {
    insertTask.run(
      task.id,
      task.title,
      task.description,
      task.status,
      task.user_id,
    );
  }

  // Comments
  const comments = [
    { id: "c1", task_id: "t1", user_id: "u2", text: "Nice work on the setup!" },
    {
      id: "c2",
      task_id: "t2",
      user_id: "u1",
      text: "Almost there with the auth.",
    },
  ];

  const insertComment = db.prepare(
    "INSERT INTO comments (id, task_id, user_id, text) VALUES (?, ?, ?, ?)",
  );
  for (const comment of comments) {
    insertComment.run(
      comment.id,
      comment.task_id,
      comment.user_id,
      comment.text,
    );
  }

  console.log("✅ Database seeded!");
}

seed().catch(console.error);
