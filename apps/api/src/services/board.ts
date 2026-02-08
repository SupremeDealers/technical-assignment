import { prisma } from "../lib/prisma";
import type { CreateBoardInput } from "../validators/board";

export async function createBoard(input: CreateBoardInput, userId: string) {
  const board = await prisma.board.create({
    data: {
      name: input.name,
      ownerId: userId,
      columns: {
        create: [
          { name: "To Do", order: 0 },
          { name: "In Progress", order: 1 },
          { name: "Done", order: 2 },
        ],
      },
    },
    include: {
      columns: {
        orderBy: { order: "asc" },
      },
    },
  });

  return board;
}

export async function getBoardsByUser(userId: string) {
  const boards = await prisma.board.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { columns: true },
      },
    },
  });

  return boards;
}

export async function getBoardById(boardId: string, userId: string) {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      ownerId: userId,
    },
    include: {
      columns: {
        orderBy: { order: "asc" },
        include: {
          _count: {
            select: { tasks: true },
          },
        },
      },
    },
  });

  return board;
}

export async function getBoardColumns(boardId: string, userId: string) {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      ownerId: userId,
    },
  });

  if (!board) {
    return null;
  }

  const columns = await prisma.column.findMany({
    where: { boardId },
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: { tasks: true },
      },
    },
  });

  return columns;
}

export async function deleteBoard(boardId: string, userId: string) {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      ownerId: userId,
    },
  });

  if (!board) {
    return null;
  }

  await prisma.board.delete({
    where: { id: boardId },
  });

  return true;
}
