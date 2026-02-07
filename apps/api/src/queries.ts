import type { PrismaClient } from "@prisma/client";

export function findBoard(prisma: PrismaClient, boardId: string, userId: string) {
  return prisma.board.findFirst({
    where: { id: boardId, ownerId: userId },
  });
}

export function findColumn(prisma: PrismaClient, columnId: string, userId: string) {
  return prisma.column.findFirst({
    where: { id: columnId, board: { ownerId: userId } },
    select: { id: true, title: true, order: true, boardId: true },
  });
}

export function findTask(prisma: PrismaClient, taskId: string, userId: string) {
  return prisma.task.findFirst({
    where: { id: taskId, board: { ownerId: userId } },
  });
}
