import { Response } from "express";
import { AuthRequest } from "../types";

import { sendError } from "../errors";
import {
  createBoardSchema,
  updateBoardSchema,
  createColumnSchema,
  updateColumnSchema,
  CreateBoardInput,
  CreateColumnInput,
  UpdateBoardInput,
  UpdateColumnInput,
} from "../validators";
import { z } from "zod";
import { BoardService } from "../services/board.service";

export class BoardController {
  private boardService: BoardService;

  constructor() {
    this.boardService = new BoardService();
  }

  // Board operations
  getUserBoards = async (req: AuthRequest, res: Response) => {
    try {
      const boards = await this.boardService.getUserBoards({
        user_id: req.user_id!,
      });
      res.json(boards);
    } catch (error) {
      return sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to fetch boards",
      });
    }
  };

  getBoard = async (req: AuthRequest, res: Response) => {
    try {
      const { boardId } = req.params;
      const board = await this.boardService.getBoardById({
        board_id: boardId,
        user_id: req.user_id!,
      });
      res.json(board);
    } catch (error) {
      if (error instanceof Error && error.message === "Board not found") {
        return sendError(res, 404, {
          code: "NOT_FOUND",
          message: "Board not found",
        });
      }
      return sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to fetch board",
      });
    }
  };
  getBoardDetails = async (req: AuthRequest, res: Response) => {
    try {
      const { boardId } = req.params;
      const board = await this.boardService.getBoardDetailsById({
        board_id: boardId,
        user_id: req.user_id!,
      });
      res.json(board);
    } catch (error) {
      if (error instanceof Error && error.message === "Board not found") {
        return sendError(res, 404, {
          code: "NOT_FOUND",
          message: "Board not found",
        });
      }
      return sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to fetch board",
      });
    }
  };

  createBoard = async (req: AuthRequest, res: Response) => {
    try {
      const input: CreateBoardInput = createBoardSchema.parse(req.body);
      const board = await this.boardService.createBoard({
        user_id: req.user_id!,
        ...input,
      });
      res.status(201).json(board);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 400, {
          code: "BAD_REQUEST",
          message: "Validation error",
          details: error.issues.map((e) => ({
            path: e.path.join("."),
            issue: e.message,
          })),
        });
      }
      return sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to create board",
      });
    }
  };

  updateBoard = async (req: AuthRequest, res: Response) => {
    try {
      const { boardId } = req.params;
      const input: UpdateBoardInput = updateBoardSchema.parse(req.body);
      const updatedBoard = await this.boardService.updateBoard({
        board_id: boardId,
        user_id: req.user_id!,
        ...input,
      });
      res.json(updatedBoard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 400, {
          code: "BAD_REQUEST",
          message: "Validation error",
          details: error.issues.map((e) => ({
            path: e.path.join("."),
            issue: e.message,
          })),
        });
      }
      return sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to update board",
      });
    }
  };

  deleteBoard = async (req: AuthRequest, res: Response) => {
    try {
      const { boardId } = req.params;
      await this.boardService.deleteBoard({
        board_id: boardId,
        user_id: req.user_id!,
      });
      res.status(204).send();
    } catch (error) {
      return sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to delete board",
      });
    }
  };

  // Column operations
  getColumns = async (req: AuthRequest, res: Response) => {
    try {
      const { boardId } = req.params;
      const columns = await this.boardService.getColumns({
        board_id: boardId,
        user_id: req.user_id!,
      });
      res.json(columns);
    } catch (error) {
      return sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to fetch columns",
      });
    }
  };

  createColumn = async (req: AuthRequest, res: Response) => {
    try {
      const { boardId } = req.params;
      const body: CreateColumnInput = createColumnSchema.parse(req.body);
      const column = await this.boardService.createColumn({
        board_id: boardId,
        user_id: req.user_id!,
        ...body,
      });
      res.status(201).json(column);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 400, {
          code: "BAD_REQUEST",
          message: "Validation error",
          details: error.issues.map((e) => ({
            path: e.path.join("."),
            issue: e.message,
          })),
        });
      }
      return sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to create column",
      });
    }
  };

  updateColumn = async (req: AuthRequest, res: Response) => {
    try {
      const { columnId } = req.params;
      const input: UpdateColumnInput = updateColumnSchema.parse(req.body);
      const updatedColumn = await this.boardService.updateColumn({
        column_id: columnId,
        user_id: req.user_id!,
        ...input,
      });
      res.json(updatedColumn);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 400, {
          code: "BAD_REQUEST",
          message: "Validation error",
          details: error.issues.map((e) => ({
            path: e.path.join("."),
            issue: e.message,
          })),
        });
      }
      return sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to update column",
      });
    }
  };

  deleteColumn = async (req: AuthRequest, res: Response) => {
    try {
      const { columnId } = req.params;
      await this.boardService.deleteColumn({
        column_id: columnId,
        user_id: req.user_id!,
      });
      res.status(201).json({ message: "Column deleted successfully" });
    } catch (error) {
      return sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to delete column",
      });
    }
  };

  getColumnById = async (req: AuthRequest, res: Response) => {
    try {
      const { column_id } = req.params;
      const user_id = req.user?.user_id;
      if (!user_id) return res.status(401).json({ error: "Unauthorized" });
      const column = await this.boardService.getColumnById({
        column_id,
        user_id,
      });
      return res.json(column);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  };
}
