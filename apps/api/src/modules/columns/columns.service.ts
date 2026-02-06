import { prisma } from "../../db/prisma";

export const getColumnsByBoard = async (boardId: string, userId: string) => {
  // Verify board ownership
  const board = await prisma.board.findFirst({
    where: { id: boardId, ownerId: userId },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  return prisma.column.findMany({
    where: { boardId },
    include: {
      tasks: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });
};

export const createColumn = async (
  boardId: string,
  name: string,
  userId: string
) => {
  // Verify board ownership
  const board = await prisma.board.findFirst({
    where: { id: boardId, ownerId: userId },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  // Get max order
  const maxOrder = await prisma.column.findFirst({
    where: { boardId },
    orderBy: { order: "desc" },
  });

  return prisma.column.create({
    data: {
      name,
      boardId,
      order: (maxOrder?.order || 0) + 1,
    },
    include: {
      tasks: true,
    },
  });
};

export const updateColumn = async (
  columnId: string,
  boardId: string,
  userId: string,
  data: { name?: string; order?: number }
) => {
  // Verify board ownership
  const board = await prisma.board.findFirst({
    where: { id: boardId, ownerId: userId },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  return prisma.column.update({
    where: { id: columnId },
    data,
    include: { tasks: true },
  });
};

export const deleteColumn = async (
  columnId: string,
  boardId: string,
  userId: string
) => {
  // Verify board ownership
  const board = await prisma.board.findFirst({
    where: { id: boardId, ownerId: userId },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  // Delete all tasks in column first
  await prisma.task.deleteMany({
    where: { columnId },
  });

  return prisma.column.delete({
    where: { id: columnId },
  });
};
