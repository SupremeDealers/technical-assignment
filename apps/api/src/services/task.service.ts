import prisma from "../lib/prisma";
import { CreateTaskInput, UpdateTaskInput } from "../validators";

export class TaskService {
  async searchTasks({
    column_id,
    user_id,
    search,
    page = 1,
    limit = 20,
    priority,
  }: {
    column_id: string;
    user_id: string;
    search?: string;
    page?: number;
    limit?: number;
    priority?: "LOW" | "MEDIUM" | "HIGH" | undefined;
  }) {
    // Check column ownership
    const column = await prisma.column.findUnique({ where: { column_id } });
    if (!column) throw new Error("Column not found");
    const board = await prisma.board.findUnique({
      where: {
        owner_id_board_id: { owner_id: user_id, board_id: column.board_id },
      },
    });
    if (!board) throw new Error("Forbidden");

    const where: any = { column_id };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (priority) {
      where.priority = priority;
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { task_order: "asc" },
        include: {
          author: {
            select: {
              user_id: true,
              username: true,
              email: true,
            },
          },
          column: {
            select: {
              column_id: true,
              name: true,
              board_id: true,
            },
          },
          _count: { select: { comments: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      tasks,
      pagination: {
        total,
        current_page: page,
        page_size: limit,
        total_pages: totalPages,
        next_page: page < totalPages ? page + 1 : null,
        prev_page: page > 1 ? page - 1 : null,
      },
    };
  }

  async getTaskById({
    task_id,
    user_id,
  }: {
    task_id: string;
    user_id: string;
  }) {
    const task = await prisma.task.findUnique({
      where: { task_id },
      include: {
        author: {
          select: {
            user_id: true,
            username: true,
            email: true,
          },
        },
        column: {
          select: {
            column_id: true,
            name: true,
            board_id: true,
          },
        },
        _count: { select: { comments: true } },
      },
    });
    if (!task) throw new Error("Task not found");
    // Check board ownership
    const board = await prisma.board.findUnique({
      where: {
        owner_id_board_id: {
          owner_id: user_id,
          board_id: task.column.board_id,
        },
      },
    });
    if (!board) throw new Error("Forbidden");
    return task;
  }

  async createTask({
    data,
    user_id,
    column_id,
  }: {
    data: CreateTaskInput;
    user_id: string;
    column_id: string;
  }) {
    const { name, description, priority } = data;
    const column = await prisma.column.findUnique({ where: { column_id } });
    if (!column) throw new Error("Column not found");
    const board = await prisma.board.findUnique({
      where: {
        owner_id_board_id: { owner_id: user_id, board_id: column.board_id },
      },
    });
    if (!board) throw new Error("Forbidden");
    await prisma.task.updateMany({
      where: { column_id },
      data: { task_order: { increment: 1 } },
    });
    return await prisma.task.create({
      data: {
        name,
        description,
        priority: priority || "MEDIUM",
        column_id,
        author_id: user_id,
        status: "TODO",
        task_order: 0,
      },
    });
  }

  async updateTask({
    task_id,
    user_id,
    data,
  }: {
    task_id: string;
    user_id: string;
    data: UpdateTaskInput;
  }) {
    const task = await prisma.task.findUnique({
      where: { task_id },
      include: { column: true },
    });
    if (!task) throw new Error("Task not found");
    const board = await prisma.board.findUnique({
      where: {
        owner_id_board_id: {
          owner_id: user_id,
          board_id: task.column.board_id,
        },
      },
    });
    if (!board) throw new Error("Forbidden");
    if (data.column_id && data.column_id !== task.column_id) {
      const newColumn = await prisma.column.findUnique({
        where: { column_id: data.column_id },
      });
      if (!newColumn) throw new Error("Column not found");
      const newBoard = await prisma.board.findUnique({
        where: {
          owner_id_board_id: {
            owner_id: user_id,
            board_id: newColumn.board_id,
          },
        },
      });
      if (!newBoard) throw new Error("Forbidden");
    }
    return await prisma.task.update({
      where: { task_id },
      data: {
        name: data.name,
        description: data.description,
        priority: data.priority,
        column_id: data.column_id || task.column_id,
      },
    });
  }

  async moveTask({
    task_id,
    user_id,
    to_column_id,
    new_order,
  }: {
    task_id: string;
    user_id: string;
    to_column_id: string;
    new_order: number;
  }) {
    const task = await prisma.task.findUnique({
      where: { task_id },
      include: { column: true },
    });
    if (!task) throw new Error("Task not found");
    const board = await prisma.board.findUnique({
      where: {
        owner_id_board_id: {
          owner_id: user_id,
          board_id: task.column.board_id,
        },
      },
    });
    if (!board) throw new Error("Forbidden");
    const toColumn = await prisma.column.findUnique({
      where: { column_id: to_column_id },
    });
    if (!toColumn) throw new Error("Target column not found");
    if (toColumn.board_id !== task.column.board_id) {
      throw new Error("Cannot move task to a column in a different board");
    }

    if (task.column_id === to_column_id) {
      const tasks = await prisma.task.findMany({
        where: { column_id: to_column_id },
        orderBy: { task_order: "asc" },
      });
      const oldIndex = tasks.findIndex((t) => t.task_id === task_id);
      if (oldIndex === -1) throw new Error("Task not found in column");
      const [movedTask] = tasks.splice(oldIndex, 1);
      tasks.splice(new_order, 0, movedTask);
      await prisma.$transaction(
        tasks.map((t, idx) =>
          prisma.task.update({
            where: { task_id: t.task_id },
            data: { task_order: idx },
          }),
        ),
      );
    } else {
      await prisma.task.updateMany({
        where: {
          column_id: task.column_id,
          task_order: { gt: task.task_order },
        },
        data: { task_order: { decrement: 1 } },
      });
      await prisma.task.updateMany({
        where: {
          column_id: to_column_id,
          task_order: { gte: new_order },
        },
        data: { task_order: { increment: 1 } },
      });
      await prisma.task.update({
        where: { task_id },
        data: { column_id: to_column_id, task_order: new_order },
      });
    }
    return await prisma.task.findUnique({ where: { task_id } });
  }

  async deleteTask({ task_id, user_id }: { task_id: string; user_id: string }) {
    const task = await prisma.task.findUnique({
      where: { task_id },
      include: { column: true },
    });
    if (!task) throw new Error("Task not found");
    const board = await prisma.board.findUnique({
      where: {
        owner_id_board_id: {
          owner_id: user_id,
          board_id: task.column.board_id,
        },
      },
    });
    if (!board) throw new Error("Forbidden");
    await prisma.task.delete({ where: { task_id } });
    return { message: "Task deleted successfully" };
  }
}
