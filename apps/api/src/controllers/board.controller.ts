import { Request, Response, NextFunction } from "express";
import boardService from "../services/board.service";
import { sendSuccess } from "../utils/response";
import { CreateBoardInput, UpdateBoardInput } from "../validators/board.schema";

export const boardController = {
  createBoard: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const data: CreateBoardInput = req.body;

      const board = await boardService.createBoard(userId, data);

      sendSuccess(res, board, "Board created successfully", 201);
    } catch (error) {
      next(error);
    }
  },

  getBoards: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      const boards = await boardService.getBoards(userId);

      sendSuccess(res, boards, "Boards retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  getBoardById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const board = await boardService.getBoardById(userId, id);

      sendSuccess(res, board, "Board retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  updateBoard: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const data: UpdateBoardInput = req.body;

      const board = await boardService.updateBoard(userId, id, data);

      sendSuccess(res, board, "Board updated successfully");
    } catch (error) {
      next(error);
    }
  },

  deleteBoard: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const result = await boardService.deleteBoard(userId, id);

      sendSuccess(res, result, "Board deleted successfully");
    } catch (error) {
      next(error);
    }
  },
};
