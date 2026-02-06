import { prisma } from "../../db/prisma";

export const findUserBoards = async (userId: string) => {
  return prisma.board.findMany({
    where: {
      ownerId: userId,
    },
    include: {
      columns: {
        orderBy: { order: "asc" },
        include: {
          tasks: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });
};

export const findBoardById = async (boardId: string, userId: string) => {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      ownerId: userId, // 🔐 ownership check
    },
    include: {
      columns: {
        orderBy: { order: "asc" },
        include: {
          tasks: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!board) {
    throw new Error("Board not found");
  }

  return board;
};

export const createBoard = async (name: string, userId: string) => {
  return prisma.board.create({
    data: {
      name,
      ownerId: userId,
    },
    include: {
      columns: {
        orderBy: { order: "asc" },
        include: {
          tasks: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });
};
