import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create User
  const passwordHash = await bcrypt.hash("password123", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      passwordHash,
    },
  });
  console.log(`User created: ${user.email}`);

  // 2. Create Board
  const board = await prisma.board.create({
    data: {
      name: "Engineering Team Board",
    },
  });
  console.log(`Board created: ${board.name}`);

  // 3. Create Columns
  const todo = await prisma.column.create({
    data: {
      title: "Todo",
      order: 1,
      boardId: board.id,
    },
  });
  const inProgress = await prisma.column.create({
    data: {
      title: "In Progress",
      order: 2,
      boardId: board.id,
    },
  });
  const done = await prisma.column.create({
    data: {
      title: "Done",
      order: 3,
      boardId: board.id,
    },
  });
  console.log("Columns created");

  // 4. Create Tasks
  const task1 = await prisma.task.create({
    data: {
      title: "Implement Auth Flow",
      columnId: todo.id,
    },
  });
  const task2 = await prisma.task.create({
    data: {
      title: "Design Board UI",
      columnId: inProgress.id,
    },
  });
  const task3 = await prisma.task.create({
    data: {
      title: "Setup Project Monorepo",
      columnId: done.id,
    },
  });
  console.log("Tasks created");

  // 5. Create Comments
  await prisma.comment.create({
    data: {
      content: "Let's use JWT for auth.",
      taskId: task1.id,
      userId: user.id,
    },
  });
  await prisma.comment.create({
    data: {
      content: "Looking good!",
      taskId: task3.id,
      userId: user.id,
    },
  });
  console.log("Comments created");

  console.log("Seeding finished!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
