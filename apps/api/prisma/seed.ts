import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.comment.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.column.deleteMany({});
  await prisma.board.deleteMany({});
  await prisma.user.deleteMany({});

  // Create demo user
  const hashedPassword = await bcryptjs.hash("password123", 10);
  const user = await prisma.user.create({
    data: {
      email: "demo@example.com",
      password: hashedPassword,
      name: "Demo User",
    },
  });

  console.log("Created user:", user);

  // Create a demo board
  const board = await prisma.board.create({
    data: {
      title: "My Project",
      userId: user.id,
    },
  });

  console.log("Created board:", board);

  // Create columns
  const todoColumn = await prisma.column.create({
    data: {
      title: "To Do",
      position: 0,
      boardId: board.id,
    },
  });

  const inProgressColumn = await prisma.column.create({
    data: {
      title: "In Progress",
      position: 1,
      boardId: board.id,
    },
  });

  const doneColumn = await prisma.column.create({
    data: {
      title: "Done",
      position: 2,
      boardId: board.id,
    },
  });

  console.log("Created columns");

  // Create tasks
  const task1 = await prisma.task.create({
    data: {
      title: "Design landing page",
      description: "Create mockups for the landing page",
      position: 0,
      boardId: board.id,
      columnId: todoColumn.id,
      userId: user.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: "Setup database",
      description: "Configure PostgreSQL and migrations",
      position: 0,
      boardId: board.id,
      columnId: inProgressColumn.id,
      userId: user.id,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: "Write API documentation",
      description: "Document all API endpoints",
      position: 0,
      boardId: board.id,
      columnId: doneColumn.id,
      userId: user.id,
    },
  });

  console.log("Created tasks");

  // Create comments
  await prisma.comment.create({
    data: {
      content: "Let's use Figma for this",
      taskId: task1.id,
      userId: user.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: "Already completed the schema",
      taskId: task2.id,
      userId: user.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: "Added examples for each endpoint",
      taskId: task3.id,
      userId: user.id,
    },
  });

  console.log("Created comments");
  console.log("Seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
