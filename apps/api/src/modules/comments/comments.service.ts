import { prisma } from "../../db/prisma";

export const getComments = async (taskId: string, userId: string) => {
  // Verify task ownership via board
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      column: { board: { ownerId: userId } },
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  return prisma.comment.findMany({
    where: { taskId },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });
};

export const createComment = async (
  taskId: string,
  userId: string,
  content: string
) => {
  // Verify task ownership via board
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      column: { board: { ownerId: userId } },
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  return prisma.comment.create({
    data: {
      content,
      taskId,
      authorId: userId,
    },
    include: { author: true },
  });
};
