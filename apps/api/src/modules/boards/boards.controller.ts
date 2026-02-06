import { Request, Response } from "express";
import { findUserBoards, findBoardById, createBoard } from "./boards.service";

export const getBoards = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const boards = await findUserBoards(userId);

  res.json(boards);
};

export const getBoardById = async (req: Request, res: Response) => {
  const { boardId } = req.params;
  const userId = req.user!.id;

  const board = await findBoardById(boardId, userId);

  res.json(board);
};

export const postBoard = async (req: Request, res: Response) => {
  const { name } = req.body;
  const userId = req.user!.id;

  const board = await createBoard(name, userId);

  res.status(201).json(board);
};
