import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data (important for re-runs)
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.column.deleteMany();
  await prisma.board.deleteMany();
  await prisma.user.deleteMany();

  // Create user
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.create({
    data: {
      email: "demo@teamboards.dev",
      passwordHash,
    },
  });

  // Create board
  const board = await prisma.board.create({
    data: {
      name: "Demo Team Board",
      ownerId: user.id,
    },
  });

  // Create columns
  const todo = await prisma.column.create({
    data: {
      name: "To Do",
      order: 1,
      boardId: board.id,
    },
  });

  const inProgress = await prisma.column.create({
    data: {
      name: "In Progress",
      order: 2,
      boardId: board.id,
    },
  });

  const done = await prisma.column.create({
    data: {
      name: "Done",
      order: 3,
      boardId: board.id,
    },
  });

  // Create tasks
  await prisma.task.createMany({
    data: [
      {
        title: "Setup project",
        description: "Initialize repo and tooling",
        order: 1,
        columnId: todo.id,
      },
      {
        title: "Implement auth",
        description: "JWT based login/register",
        order: 2,
        columnId: todo.id,
      },
      {
        title: "Design schema",
        description: "Boards, columns, tasks, comments",
        order: 1,
        columnId: inProgress.id,
      },
      {
        title: "Ship MVP",
        description: "Core features working",
        order: 1,
        columnId: done.id,
      },
    ],
  });

  console.log("✅ Seeding completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
