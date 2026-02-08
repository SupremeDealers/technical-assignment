import prisma from "../lib/prisma";
import { CreateBoardInput, UpdateBoardInput } from "../validators";

export class BoardService {
  async getBoard({ user_id, board_id }: { user_id: string; board_id: string }) {
    const board = await prisma.board.findUnique({
      where: { owner_id_board_id: { owner_id: user_id, board_id } },
    });
    if (!board) throw new Error("Board not found");
    return board;
  }
  async getUserBoards({ user_id }: { user_id: string }) {
    return await prisma.board.findMany({
      where: { owner_id: user_id },
      include: {
        columns: {
          orderBy: { position: "asc" },
          include: {
            _count: { select: { tasks: true } },
          },
        },
      },
    });
  }

  async getBoardById({
    board_id,
    user_id,
  }: {
    board_id: string;
    user_id: string;
  }) {
    const board = await prisma.board.findUnique({
      where: { owner_id_board_id: { owner_id: user_id, board_id } },
      include: {
        columns: {
          orderBy: { position: "asc" },
          include: {
            _count: { select: { tasks: true } },
            tasks: {
              orderBy: { task_order: "asc" },
            },
          },
        },
      },
    });
    if (!board) throw new Error("Board not found");
    return board;
  }

  async getBoardDetailsById({
    board_id,
    user_id,
  }: {
    board_id: string;
    user_id: string;
  }) {
    const board = await prisma.board.findUnique({
      where: { owner_id_board_id: { owner_id: user_id, board_id } },
      include: {
        columns: {
          orderBy: { position: "asc" },
          include: {
            _count: { select: { tasks: true } },
            tasks: true,
          },
        },
      },
    });
    if (!board) throw new Error("Board not found");
    return board;
  }

  async createBoard({
    user_id,
    name,
    description,
    columns,
  }: {
    user_id: string;
  } & CreateBoardInput) {
    try {
      return await prisma.board.create({
        data: {
          name,
          description,
          owner_id: user_id,
          columns: {
            createMany: {
              data:
                columns?.map((col, index) => ({
                  name: col.name,
                  position: col.position,
                })) || [],
            },
          },
        },
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async updateBoard(
    data: {
      user_id: string;
      board_id: string;
    } & UpdateBoardInput,
  ) {
    try {
      const board = await this.getBoard({
        user_id: data.user_id,
        board_id: data.board_id,
      });

      const updatedBoard = await prisma.board.update({
        where: { board_id: data.board_id },
        data: {
          name: data.name ?? board.name,
          description: data.description ?? board.description,
        },
      });

      if (data.columns) {
        const existingColumns = await prisma.column.findMany({
          where: { board_id: data.board_id },
        });
        const existingIds = existingColumns.map((col) => col.column_id);
        const sentIds = data.columns
          .filter((col) => col.column_id)
          .map((col) => col.column_id);

        const toDelete = existingIds.filter((id) => !sentIds.includes(id));
        if (toDelete.length > 0) {
          await prisma.column.deleteMany({
            where: { column_id: { in: toDelete } },
          });
        }
        for (const [index, col] of data.columns.entries()) {
          if (col.column_id && existingIds.includes(col.column_id)) {
            await prisma.column.update({
              where: { column_id: col.column_id },
              data: {
                name: col.name,
                position:
                  typeof col.position === "number" ? col.position : index,
              },
            });
          } else {
            await prisma.column.create({
              data: {
                name: col.name,
                position:
                  typeof col.position === "number" ? col.position : index,
                board_id: data.board_id,
              },
            });
          }
        }
      }

      return updatedBoard;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async deleteBoard({
    board_id,
    user_id,
  }: {
    board_id: string;
    user_id: string;
  }) {
    try {
      const board = await this.getBoard({ user_id, board_id });
      await prisma.board.delete({
        where: { board_id: board.board_id },
      });

      return {
        message: "Board deleted successfully",
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getColumns({
    board_id,
    user_id,
  }: {
    board_id: string;
    user_id: string;
  }) {
    try {
      const board = await this.getBoard({ user_id, board_id });

      return await prisma.column.findMany({
        where: { board_id: board.board_id },
        orderBy: { position: "asc" },
        include: {
          _count: { select: { tasks: true } },
        },
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getColumnById({
    column_id,
    user_id,
  }: {
    column_id: string;
    user_id: string;
  }) {
    try {
      const column = await prisma.column.findUnique({
        where: { column_id },
      });

      if (!column) throw new Error("Column not found");
      const board = await this.getBoard({ user_id, board_id: column.board_id });
      if (board.owner_id !== user_id) {
        throw new Error("Column not found");
      }
      return column;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async createColumn({
    board_id,
    name,
    user_id,
  }: {
    board_id: string;
    name: string;
    user_id: string;
  }) {
    try {
      const board = await this.getBoard({ user_id, board_id });

      const maxPosition = await prisma.column.aggregate({
        where: { board_id },
        _max: { position: true },
      });
      return await prisma.column.create({
        data: {
          name,
          board_id,
          position: (maxPosition._max.position ?? -1) + 1,
        },
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async updateColumn(data: {
    name?: string;
    column_id: string;
    user_id: string;
  }) {
    try {
      const column = await prisma.column.findUnique({
        where: { column_id: data.column_id },
      });

      if (!column) throw new Error("Column not found");
      const board = await this.getBoard({
        user_id: data.user_id,
        board_id: column.board_id,
      });
      if (board.owner_id !== data.user_id) {
        throw new Error("Column not found");
      }
      return await prisma.column.update({
        where: { column_id: data.column_id },
        data: {
          name: data.name,
        },
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async deleteColumn(data: { column_id: string; user_id: string }) {
    const column = await prisma.column.findUnique({
      where: { column_id: data.column_id },
    });

    if (!column) throw new Error("Column not found");
    const board = await this.getBoard({
      user_id: data.user_id,
      board_id: column.board_id,
    });
    if (board.owner_id !== data.user_id) {
      throw new Error("Column not found");
    }
    await prisma.column.delete({
      where: { column_id: data.column_id },
    });

    return {
      message: "Column deleted successfully",
    };
  }
}
