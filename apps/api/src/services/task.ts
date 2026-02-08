import { prisma } from "../lib/prisma";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskQueryInput,
} from "../validators/task";

const priorityOrder = { high: 0, medium: 1, low: 2 };

export async function createTask(
  columnId: string,
  input: CreateTaskInput,
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

  const maxOrder = await prisma.task.aggregate({
    where: { columnId },
    _max: { order: true },
  });

  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      priority: input.priority,
      order: (maxOrder._max.order ?? -1) + 1,
      columnId,
      creatorId: userId,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: { comments: true },
      },
    },
  });

  return { task };
}

export async function getTasksByColumn(
  columnId: string,
  query: TaskQueryInput,
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

  const where = {
    columnId,
    ...(query.search && {
      OR: [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
      ],
    }),
  };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy:
        query.sort === "priority"
          ? [{ priority: "asc" }, { order: "asc" }]
          : [{ createdAt: "desc" }],
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    }),
    prisma.task.count({ where }),
  ]);

  // Sort by priority order if needed
  if (query.sort === "priority") {
    tasks.sort((a: { priority: string }, b: { priority: string }) => {
      const aOrder = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 1;
      const bOrder = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 1;
      return aOrder - bOrder;
    });
  }

  return {
    tasks,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getTaskById(taskId: string, userId: string) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      column: {
        board: {
          ownerId: userId,
        },
      },
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      column: {
        select: {
          id: true,
          name: true,
          boardId: true,
        },
      },
      _count: {
        select: { comments: true },
      },
    },
  });

  return task;
}

export async function updateTask(
  taskId: string,
  input: UpdateTaskInput,
  userId: string
) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      column: {
        board: {
          ownerId: userId,
        },
      },
    },
  });

  if (!task) {
    return { error: "Task not found" };
  }

  // If moving to a new column, verify the column belongs to the user
  if (input.columnId && input.columnId !== task.columnId) {
    const newColumn = await prisma.column.findFirst({
      where: {
        id: input.columnId,
        board: {
          ownerId: userId,
        },
      },
    });

    if (!newColumn) {
      return { error: "Target column not found" };
    }

    // If no order specified, add to end of new column
    if (input.order === undefined) {
      const maxOrder = await prisma.task.aggregate({
        where: { columnId: input.columnId },
        _max: { order: true },
      });
      input.order = (maxOrder._max.order ?? -1) + 1;
    }
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      title: input.title,
      description: input.description,
      priority: input.priority,
      columnId: input.columnId,
      order: input.order,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      column: {
        select: {
          id: true,
          name: true,
          boardId: true,
        },
      },
      _count: {
        select: { comments: true },
      },
    },
  });

  return { task: updated };
}

export async function deleteTask(taskId: string, userId: string) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      column: {
        board: {
          ownerId: userId,
        },
      },
    },
  });

  if (!task) {
    return { error: "Task not found" };
  }

  await prisma.task.delete({
    where: { id: taskId },
  });

  return { success: true };
}

export async function getAllTasksForBoard(boardId: string, userId: string) {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      ownerId: userId,
    },
  });

  if (!board) {
    return { error: "Board not found" };
  }

  const tasks = await prisma.task.findMany({
    where: {
      column: {
        boardId,
      },
    },
    orderBy: { order: "asc" },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: { comments: true },
      },
    },
  });

  return { tasks };
}
