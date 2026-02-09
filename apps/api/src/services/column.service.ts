import { Column } from "../models";
import { CreateColumnInput, UpdateColumnInput } from "../validators/column.schema";
import boardService from "./board.service";
import { createError } from "../utils/createError";

const columnService = {
  async createColumn(userId: string, boardId: string, data: CreateColumnInput) {
    // Verify board ownership
    await boardService.verifyBoardOwnership(userId, boardId);

    // Get next order if not provided
    let order = data.order;

    // if (order === undefined) {
    //   const maxOrderColumn = await Column.findOne({
    //     where: { boardId },
    //     order: [["order", "DESC"]],
    //   });

    //   order = maxOrderColumn ? maxOrderColumn.order + 1 : 0;
    // }

    if (order === undefined) {
      const maxOrderColumn = await Column.findOne({
        where: { boardId },
        order: [["order", "DESC"]],
      });

      order = maxOrderColumn
        ? (maxOrderColumn.getDataValue("order") as number) + 1
        : 0;
    }


    const column = await Column.create({
      title: data.title,
      order,
      boardId,
    });

    return column;
  },

  async updateColumn(userId: string, columnId: string, data: UpdateColumnInput) {
    const column = await Column.findByPk(columnId);

    if (!column) {
      throw createError(404, "Column not found");
    }

    const boardId = column.getDataValue("boardId") as string;

    // Verify board ownership
    await boardService.verifyBoardOwnership(userId, boardId);

    await column.update(data);

    return column;
  },

  async deleteColumn(userId: string, columnId: string) {
    const column = await Column.findByPk(columnId);

    if (!column) {
      throw createError(404, "Column not found");
    }

    const boardId = column.getDataValue("boardId") as string;

    // Verify board ownership
    await boardService.verifyBoardOwnership(userId, boardId);

    await column.destroy();

    return { message: "Column deleted successfully" };
  },
};

export default columnService;
