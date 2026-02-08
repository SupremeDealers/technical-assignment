import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const password = await bcrypt.hash("password123", 10);

  const user1 = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: { email: "alice@example.com", password, name: "Alice Johnson" },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: { email: "bob@example.com", password, name: "Bob Smith" },
  });

  console.log("Created users:", user1.email, user2.email);

  const board = await prisma.board.create({
    data: {
      name: "Project Alpha",
      ownerId: user1.id,
      columns: {
        create: [
          { name: "Backlog", order: 0 },
          { name: "To Do", order: 1 },
          { name: "In Progress", order: 2 },
          { name: "Review", order: 3 },
          { name: "Done", order: 4 },
        ],
      },
    },
    include: { columns: true },
  });

  console.log("Created board:", board.name);

  const [backlog, todo, inProgress, review, done] = board.columns;

  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: "Set up project repository",
        description: "Initialize Git repository and set up basic project structure",
        priority: "high",
        order: 0,
        columnId: done.id,
        creatorId: user1.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Design database schema",
        description: "Create ERD and define all database tables and relationships",
        priority: "high",
        order: 1,
        columnId: done.id,
        creatorId: user1.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Implement user authentication",
        description: "Add JWT-based authentication with login and registration",
        priority: "high",
        order: 0,
        columnId: review.id,
        creatorId: user1.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Build REST API endpoints",
        description: "Create CRUD endpoints for boards, columns, tasks, and comments",
        priority: "medium",
        order: 0,
        columnId: inProgress.id,
        creatorId: user1.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Add drag and drop support",
        description: "Implement drag and drop for moving tasks between columns",
        priority: "medium",
        order: 1,
        columnId: inProgress.id,
        creatorId: user1.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Design UI components",
        description: "Create reusable React components for the board interface",
        priority: "medium",
        order: 0,
        columnId: todo.id,
        creatorId: user1.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Write unit tests",
        description: "Add comprehensive unit tests for API endpoints and services",
        priority: "low",
        order: 1,
        columnId: todo.id,
        creatorId: user1.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Add search functionality",
        description: "Implement search and filtering for tasks",
        priority: "low",
        order: 0,
        columnId: backlog.id,
        creatorId: user1.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Performance optimization",
        description: "Optimize database queries and frontend rendering",
        priority: "low",
        order: 1,
        columnId: backlog.id,
        creatorId: user1.id,
      },
    }),
  ]);

  console.log("Created", tasks.length, "tasks");

  await prisma.comment.createMany({
    data: [
      { content: "Great progress on this! The schema looks solid.", taskId: tasks[1].id, authorId: user1.id },
      { content: "I added some indexes for better query performance.", taskId: tasks[1].id, authorId: user1.id },
      { content: "JWT implementation is complete, need to add refresh tokens.", taskId: tasks[2].id, authorId: user1.id },
      { content: "Working on the task endpoints now.", taskId: tasks[3].id, authorId: user1.id },
    ],
  });

  console.log("Created comments");

  await prisma.board.create({
    data: {
      name: "Personal Tasks",
      ownerId: user2.id,
      columns: {
        create: [
          { name: "To Do", order: 0 },
          { name: "In Progress", order: 1 },
          { name: "Done", order: 2 },
        ],
      },
    },
  });

  console.log("Seeding completed!");
  console.log("\nDemo accounts:");
  console.log("  alice@example.com / password123");
  console.log("  bob@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
