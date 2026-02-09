import { Op } from "sequelize";
import { Task, Column } from "../models";
import {
  CreateTaskInput,
  UpdateTaskInput,
  MoveTaskInput,
} from "../validators/task.schema";
import { PaginationQuery } from "../validators/pagination.schema";
import boardService from "./board.service";
import sequelize from "../config/database";
import { createError } from "../utils/createError";

const taskService = {
  async createTask(userId: string, columnId: string, data: CreateTaskInput) {
    const column = await Column.findByPk(columnId);

    if (!column) {
      throw createError(404, "Column not found");
    }

    const boardId = column.getDataValue("boardId") as string;

    // Verify board ownership
    await boardService.verifyBoardOwnership(userId, boardId);

    let order = data.order;

    if (order === undefined) {
      const maxOrderTask = await Task.findOne({
        where: { columnId },
        order: [["order", "DESC"]],
      });

      order = maxOrderTask ? (maxOrderTask.getDataValue("order") as number) + 1 : 0;
    }

    const task = await Task.create({
      title: data.title,
      description: data.description || null,
      order,
      columnId,
      boardId: boardId,
    });

    return task;
  },

  async getTasks(userId: string, boardId: string, query: PaginationQuery) {
    await boardService.verifyBoardOwnership(userId, boardId);

    const { page = 1, limit = 10, search } = query;
    const offset = (page - 1) * limit;

    const whereClause: any = { boardId };

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows: tasks, count: total } = await Task.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async updateTask(userId: string, taskId: string, data: UpdateTaskInput) {
    const task = await Task.findByPk(taskId);

    if (!task) {
      throw createError(404, "Task not found");
    }

    await boardService.verifyBoardOwnership(userId, task.getDataValue("boardId") as string);

    await task.update(data);

    return task;
  },

  async deleteTask(userId: string, taskId: string) {
    const task = await Task.findByPk(taskId);

    if (!task) {
      throw createError(404, "Task not found");
    }

    await boardService.verifyBoardOwnership(userId, task.getDataValue("boardId") as string);

    await task.destroy();

    return { message: "Task deleted successfully" };
  },

  async moveTask(userId: string, taskId: string, data: MoveTaskInput) {
    const transaction = await sequelize.transaction();

    try {
      const task = await Task.findByPk(taskId, { transaction });

      if (!task) {
        throw createError(404, "Task not found");
      }

      await boardService.verifyBoardOwnership(userId, task.getDataValue("boardId") as string);

      const targetColumn = await Column.findByPk(data.columnId, { transaction });

      if (!targetColumn) {
        throw createError(404, "Target column not found");
      }

      if (targetColumn.getDataValue("boardId") !== task.getDataValue("boardId")) {
        throw createError(400, "Cannot move task to a column in a different board");
      }

      const oldColumnId = task.getDataValue("columnId") as string | null || data.columnId;
      const newColumnId = data.columnId;
      const newOrder = data.order;

      if (oldColumnId !== newColumnId) {
        await Task.update(
          { order: sequelize.literal("order - 1") },
          {
            where: {
              columnId: oldColumnId,
              order: { [Op.gt]: task.getDataValue("order") as number },
            },
            transaction,
          }
        );
      }

      await Task.update(
        { order: sequelize.literal("order + 1") },
        {
          where: {
            columnId: newColumnId,
            order: { [Op.gte]: newOrder },
            id: { [Op.ne]: taskId },
          },
          transaction,
        }
      );

      await task.update(
        {
          columnId: newColumnId,
          order: newOrder,
        },
        { transaction }
      );

      await transaction.commit();

      return task;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};

export default taskService;
