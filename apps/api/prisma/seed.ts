import bcrypt from "bcrypt";

import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Demo user:");
  // Clear old data (safe for dev)
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.column.deleteMany();
  await prisma.board.deleteMany();
  await prisma.user.deleteMany();

  // Create demo users
  const password = await bcrypt.hash("password123", 10);

  const user = await prisma.user.create({
    data: {
      email: "demo@test.com",
      name: "Demo User",
      password,
    },
  });

  console.log("Demo user:");
  console.log("Email: demo@test.com");
  console.log("Password: password123");

  // Create board
  const board = await prisma.board.create({
    data: {
      name: "Demo Board",
      ownerId: user.id,
    },
  });

  // Create columns
  const columns = await prisma.column.createMany({
    data: [
      { name: "Todo", order: 1, boardId: board.id },
      { name: "In Progress", order: 2, boardId: board.id },
      { name: "Done", order: 3, boardId: board.id },
    ],
  });

  const [todo] = await prisma.column.findMany({
    where: { boardId: board.id, name: "Todo" },
  });

  // Create tasks
  await prisma.task.createMany({
    data: [
      {
        title: "Setup project",
        description: "Install dependencies",
        boardId: board.id,
        columnId: todo.id,
        authorId: user.id,
        position: 1,
      },
      {
        title: "Build auth",
        description: "Register & login",
        boardId: board.id,
        columnId: todo.id,
        authorId: user.id,
        position: 2,
      },
      {
        title: "Create tasks API",
        description: "CRUD + pagination",
        boardId: board.id,
        columnId: todo.id,
        authorId: user.id,
        position: 3,
      },
    ],
  });

  console.log("Seed complete");
  console.log("Board ID:", board.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
