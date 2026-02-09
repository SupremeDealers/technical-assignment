import { Request, Response, NextFunction } from "express";
import columnService from "../services/column.service";
import { sendSuccess } from "../utils/response";
import { CreateColumnInput, UpdateColumnInput } from "../validators/column.schema";

export const columnController = {
  createColumn: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { boardId } = req.params;
      const data: CreateColumnInput = req.body;

      const column = await columnService.createColumn(userId, boardId, data);

      sendSuccess(res, column, "Column created successfully", 201);
    } catch (error) {
      next(error);
    }
  },

  updateColumn: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const data: UpdateColumnInput = req.body;

      const column = await columnService.updateColumn(userId, id, data);

      sendSuccess(res, column, "Column updated successfully");
    } catch (error) {
      next(error);
    }
  },

  deleteColumn: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const result = await columnService.deleteColumn(userId, id);

      sendSuccess(res, result, "Column deleted successfully");
    } catch (error) {
      next(error);
    }
  },
};
