import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data to avoid conflicts
  await prisma.comment.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.column.deleteMany({});
  await prisma.board.deleteMany({});

  // 1. Create Users
  const passwordHash = await bcrypt.hash("password123", 10);
  const user1 = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      passwordHash,
    },
  });
  const user2 = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      passwordHash,
    },
  });
  console.log(`Users created: ${user1.email}, ${user2.email}`);

  // 2. Create Board
  const board = await prisma.board.create({
    data: {
      name: "Kanban Application",
    },
  });
  console.log(`Board created: ${board.name}`);

  // 3. Create Columns
  const todo = await prisma.column.create({
    data: { title: "Todo", order: 1, boardId: board.id },
  });
  const inProgress = await prisma.column.create({
    data: { title: "In Progress", order: 2, boardId: board.id },
  });
  const review = await prisma.column.create({
    data: { title: "Review", order: 3, boardId: board.id },
  });
  const done = await prisma.column.create({
    data: { title: "Done", order: 4, boardId: board.id },
  });
  console.log("4 Columns created");

  // 4. Create Tasks
  await prisma.task.create({
    data: {
      title: "Configure ESLint and Prettier",
      description:
        "Setup linting and type checking for both frontend and backend",
      priority: "MEDIUM",
      columnId: todo.id,
      userId: user1.id,
    },
  });
  await prisma.task.create({
    data: {
      title: "Add drag-and-drop functionality",
      description: "Implement drag-and-drop for moving tasks between columns",
      priority: "LOW",
      columnId: inProgress.id,
      userId: user2.id,
    },
  });
  await prisma.task.create({
    data: {
      title: "Setup project structure",
      description: "Initialize monorepo with API and web applications",
      priority: "HIGH",
      columnId: review.id,
      userId: user1.id,
    },
  });
  await prisma.task.create({
    data: {
      title: "Add new task",
      priority: "MEDIUM",
      columnId: done.id,
    },
  });
  console.log("Tasks seeded with priorities and assignees");

  console.log("Seeding finished!");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
