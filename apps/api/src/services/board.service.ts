import { Board, Column, Task } from "../models";
import { CreateBoardInput, UpdateBoardInput } from "../validators/board.schema";
import sequelize from "../config/database";
import { createError } from "../utils/createError";

const boardService = {
  async createBoard(userId: string, data: CreateBoardInput) {
    const board = await Board.create({
      name: data.name,
      userId,
    });

    return board;
  },

  async getBoards(userId: string) {
    const boards = await Board.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    return boards;
  },

  async getBoardById(userId: string, boardId: string) {
    const board = await Board.findOne({
      where: { id: boardId, userId },
      include: [
        {
          model: Column,
          as: "columns",
          include: [
            {
              model: Task,
              as: "tasks",
              separate: true,
              order: [["order", "ASC"]],
            },
          ],
          separate: true,
          order: [["order", "ASC"]],
        },
      ],
    });

    if (!board) {
      throw createError(404, "Board not found");
    }

    return board;
  },

  async updateBoard(userId: string, boardId: string, data: UpdateBoardInput) {
    const board = await Board.findOne({
      where: { id: boardId, userId },
    });

    if (!board) {
      throw createError(404, "Board not found");
    }

    await board.update(data);

    return board;
  },

  async deleteBoard(userId: string, boardId: string) {
    const board = await Board.findOne({
      where: { id: boardId, userId },
    });

    if (!board) {
      throw createError(404, "Board not found");
    }

    const transaction = await sequelize.transaction();

    try {
      await Task.destroy({
        where: { boardId },
        transaction,
      });

      await Column.destroy({
        where: { boardId },
        transaction,
      });

      await board.destroy({ transaction });

      await transaction.commit();

      return { message: "Board deleted successfully" };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async verifyBoardOwnership(userId: string, boardId: string) {
    const board = await Board.findOne({
      where: { id: boardId, userId },
    });

    if (!board) {
      throw createError(404, "Board not found or access denied");
    }

    return board;
  },
};

export default boardService;
