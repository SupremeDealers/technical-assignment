import { db } from "./index";
import { users, boards, columns, tasks, comments } from "./schema";
import bcrypt from "bcrypt";

async function seed() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  const [user1] = await db
    .insert(users)
    .values([
      {
        email: "demo@example.com",
        password: hashedPassword,
        name: "Demo User",
      },
      {
        email: "john@example.com",
        password: hashedPassword,
        name: "John Doe",
      },
    ])
    .returning();

  const [board] = await db
    .insert(boards)
    .values({
      name: "Project Board",
      description: "Main project board for task management",
    })
    .returning();

  const [todoCol, inProgressCol, doneCol] = await db
    .insert(columns)
    .values([
      { boardId: board.id, name: "To Do", position: 0 },
      { boardId: board.id, name: "In Progress", position: 1 },
      { boardId: board.id, name: "Done", position: 2 },
    ])
    .returning();

  const [task1, task2, task3] = await db
    .insert(tasks)
    .values([
      {
        columnId: todoCol.id,
        title: "Setup project repository",
        description: "Initialize git repo and setup CI/CD",
        priority: "high",
        position: 0,
        createdById: user1.id,
      },
      {
        columnId: inProgressCol.id,
        title: "Design database schema",
        description: "Create tables for users, tasks, and comments",
        priority: "high",
        position: 0,
        createdById: user1.id,
      },
      {
        columnId: doneCol.id,
        title: "Setup development environment",
        description: "Install Node, pnpm, and configure editor",
        priority: "medium",
        position: 0,
        createdById: user1.id,
      },
    ])
    .returning();

  await db.insert(comments).values([
    {
      taskId: task2.id,
      userId: user1.id,
      content: "Started working on the schema design",
    },
    {
      taskId: task2.id,
      userId: user1.id,
      content: "Using Drizzle ORM for better type safety",
    },
  ]);

  console.log("Database seeded successfully!");
  console.log(`Demo credentials: demo@example.com / password123`);
}

seed().catch(console.error);
