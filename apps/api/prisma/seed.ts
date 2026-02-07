import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/auth/password";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@teamboards.local";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  const passwordHash = await hashPassword("password123");
  const user = await prisma.user.create({
    data: {
      email,
      name: "Demo User",
      passwordHash,
      boards: {
        create: {
          title: "Demo Board",
          columns: {
            create: [
              { title: "Todo", order: 1 },
              { title: "Doing", order: 2 },
              { title: "Done", order: 3 },
            ],
          },
        },
      },
    },
    include: { boards: { include: { columns: true } } },
  });

  const [todo, doing] = user.boards[0]?.columns ?? [];
  if (!todo || !doing) return;

  const task1 = await prisma.task.create({
    data: {
      title: "Draft project brief",
      description: "Summarize scope and success criteria.",
      priority: 2,
      boardId: user.boards[0].id,
      columnId: todo.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: "Set up repo",
      description: "Initialize tooling and CI.",
      priority: 1,
      boardId: user.boards[0].id,
      columnId: doing.id,
    },
  });

  await prisma.comment.createMany({
    data: [
      {
        body: "Kick this off today.",
        taskId: task1.id,
        authorId: user.id,
      },
      {
        body: "CI is green.",
        taskId: task2.id,
        authorId: user.id,
      },
    ],
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
