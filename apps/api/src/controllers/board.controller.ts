import { Response } from "express";
import { AuthRequest } from "../types";
import { sendError, zodError } from "../errors";
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
      return zodError(res, error as z.ZodError);
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
      return zodError(res, error as z.ZodError);
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
      return zodError(res, error as z.ZodError);
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
      return zodError(res, error as z.ZodError);
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
      return zodError(res, error as z.ZodError);
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
      return zodError(res, error as z.ZodError);
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
      return zodError(res, error as z.ZodError);
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
      return zodError(res, error as z.ZodError);
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
      return zodError(res, error as z.ZodError);
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
      return zodError(res, error as z.ZodError);
    }
  };

  getColumnById = async (req: AuthRequest, res: Response) => {
    try {
      const { column_id } = req.params;
      const user_id = req.user?.user_id;
      if (!user_id) {
        return sendError(res, 401, {
          message: "Unauthorized",
        });
      }
      const column = await this.boardService.getColumnById({
        column_id,
        user_id,
      });
      return res.json(column);
    } catch (error: any) {
      return zodError(res, error as z.ZodError);
    }
  };
}
