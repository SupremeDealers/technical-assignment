import { prisma } from "../../db/prisma";

interface GetTasksParams {
  columnId: string;
  userId: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: "createdAt" | "title";
}

export const getTasks = async ({
  columnId,
  userId,
  search,
  page = 1,
  limit = 10,
  sort = "createdAt",
}: GetTasksParams) => {
  // Verify column ownership via board
  const column = await prisma.column.findFirst({
    where: {
      id: columnId,
      board: { ownerId: userId },
    },
  });

  if (!column) {
    throw new Error("Column not found");
  }

  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where: {
        columnId,
        title: search
          ? {
              contains: search,
            }
          : undefined,
      },
      include: {
        comments: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: {
        [sort]: "asc",
      },
      skip,
      take: limit,
    }),
    prisma.task.count({
      where: {
        columnId,
        title: search
          ? {
              contains: search,
            }
          : undefined,
      },
    }),
  ]);

  return {
    tasks,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const createTask = async (
  columnId: string,
  userId: string,
  data: { title: string; description?: string }
) => {
  // Verify column ownership via board
  const column = await prisma.column.findFirst({
    where: {
      id: columnId,
      board: { ownerId: userId },
    },
  });

  if (!column) {
    throw new Error("Column not found");
  }

  // Get max order
  const maxOrder = await prisma.task.findFirst({
    where: { columnId },
    orderBy: { order: "desc" },
  });

  return prisma.task.create({
    data: {
      ...data,
      columnId,
      order: (maxOrder?.order || 0) + 1,
    },
    include: { comments: true },
  });
};

export const updateTask = async (
  taskId: string,
  userId: string,
  data: {
    title?: string;
    description?: string;
    columnId?: string;
    order?: number;
  }
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

  return prisma.task.update({
    where: { id: taskId },
    data,
    include: { comments: true },
  });
};

export const deleteTask = async (taskId: string, userId: string) => {
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

  // Delete all comments first
  await prisma.comment.deleteMany({
    where: { taskId },
  });

  return prisma.task.delete({
    where: { id: taskId },
  });
};
