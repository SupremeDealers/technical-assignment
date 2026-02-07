import { prisma } from "../src/db";

export async function ensureSchema() {
  await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = ON;`);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      passwordHash TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Board" (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      ownerId TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ownerId) REFERENCES "User"(id) ON DELETE CASCADE
    );
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Column" (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      "order" INTEGER NOT NULL,
      boardId TEXT NOT NULL,
      FOREIGN KEY (boardId) REFERENCES "Board"(id) ON DELETE CASCADE
    );
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Task" (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      priority INTEGER NOT NULL DEFAULT 0,
      boardId TEXT NOT NULL,
      columnId TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (boardId) REFERENCES "Board"(id) ON DELETE CASCADE,
      FOREIGN KEY (columnId) REFERENCES "Column"(id) ON DELETE CASCADE
    );
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Comment" (
      id TEXT PRIMARY KEY,
      body TEXT NOT NULL,
      taskId TEXT NOT NULL,
      authorId TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (taskId) REFERENCES "Task"(id) ON DELETE CASCADE,
      FOREIGN KEY (authorId) REFERENCES "User"(id) ON DELETE CASCADE
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "Column_boardId_order_idx" ON "Column"(boardId, "order");`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "Task_columnId_createdAt_idx" ON "Task"(columnId, createdAt);`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "Task_boardId_createdAt_idx" ON "Task"(boardId, createdAt);`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "Comment_taskId_createdAt_idx" ON "Comment"(taskId, createdAt);`
  );
}

export async function resetDb() {
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.column.deleteMany();
  await prisma.board.deleteMany();
  await prisma.user.deleteMany();
}
