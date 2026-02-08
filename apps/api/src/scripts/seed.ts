import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.column.deleteMany();
  await prisma.board.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const password = await bcrypt.hash("password123", 10);

  const user1 = await prisma.user.create({
    data: {
      email: "demo@example.com",
      username: "demo_user",
      password,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "alice@example.com",
      username: "alice",
      password,
    },
  });

  console.log(`✅ Created 2 users`);

  // Create board for user1
  const board = await prisma.board.create({
    data: {
      name: "Project Dashboard",
      description: "Main project management board",
      owner_id: user1.user_id,
    },
  });

  console.log(`✅ Created board: ${board.name}`);

  // Create columns
  const todoColumn = await prisma.column.create({
    data: {
      name: "To Do",
      position: 0,
      board_id: board.board_id,
    },
  });

  const inProgressColumn = await prisma.column.create({
    data: {
      name: "In Progress",
      position: 1,
      board_id: board.board_id,
    },
  });

  const doneColumn = await prisma.column.create({
    data: {
      name: "Done",
      position: 2,
      board_id: board.board_id,
    },
  });

  console.log(`✅ Created 3 columns`);

  // Create tasks
  const task1 = await prisma.task.create({
    data: {
      name: "Set up project structure",
      description:
        "Initialize the repository and set up basic folder structure",
      priority: "HIGH",
      status: "DONE",
      column_id: doneColumn.column_id,
      author_id: user1.user_id,
      task_order: 0,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      name: "Implement authentication",
      description:
        "Add JWT-based authentication with register and login endpoints",
      priority: "HIGH",
      status: "IN_PROGRESS",
      column_id: inProgressColumn.column_id,
      author_id: user1.user_id,
      task_order: 0,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      name: "Build board UI",
      description: "Create the kanban board interface with drag and drop",
      priority: "MEDIUM",
      status: "TODO",
      column_id: todoColumn.column_id,
      author_id: user2.user_id,
      task_order: 0,
    },
  });

  // Create comments
  await prisma.comment.create({
    data: {
      content: "Great work on setting this up!",
      task_id: task1.task_id,
      author_id: user2.user_id,
    },
  });

  await prisma.comment.create({
    data: {
      content: "Almost done with the login flow",
      task_id: task2.task_id,
      author_id: user1.user_id,
    },
  });

  await prisma.comment.create({
    data: {
      content: "We should use framer-motion for animations",
      task_id: task3.task_id,
      author_id: user1.user_id,
    },
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
