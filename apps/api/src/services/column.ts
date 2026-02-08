import { prisma } from "../lib/prisma";
import type { CreateColumnInput, UpdateColumnInput } from "../validators/column";

export async function createColumn(
  boardId: string,
  input: CreateColumnInput,
  userId: string
) {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      ownerId: userId,
    },
  });

  if (!board) {
    return { error: "Board not found" };
  }

  const maxOrder = await prisma.column.aggregate({
    where: { boardId },
    _max: { order: true },
  });

  const column = await prisma.column.create({
    data: {
      name: input.name,
      order: (maxOrder._max.order ?? -1) + 1,
      boardId,
    },
    include: {
      _count: {
        select: { tasks: true },
      },
    },
  });

  return { column };
}

export async function updateColumn(
  columnId: string,
  input: UpdateColumnInput,
  userId: string
) {
  const column = await prisma.column.findFirst({
    where: {
      id: columnId,
      board: {
        ownerId: userId,
      },
    },
  });

  if (!column) {
    return { error: "Column not found" };
  }

  const updated = await prisma.column.update({
    where: { id: columnId },
    data: {
      name: input.name,
      order: input.order,
    },
    include: {
      _count: {
        select: { tasks: true },
      },
    },
  });

  return { column: updated };
}

export async function deleteColumn(columnId: string, userId: string) {
  const column = await prisma.column.findFirst({
    where: {
      id: columnId,
      board: {
        ownerId: userId,
      },
    },
  });

  if (!column) {
    return { error: "Column not found" };
  }

  await prisma.column.delete({
    where: { id: columnId },
  });

  return { success: true };
}
