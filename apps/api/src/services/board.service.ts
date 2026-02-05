import * as boardRepository from "../repositories/board.repository";
import * as columnRepository from "../repositories/column.repository";
import type { Board, Column } from "../types/entities";

export function getBoard(boardId: number): Board {
  const board = boardRepository.findById(boardId);
  if (!board) {
    throw { code: "NOT_FOUND" as const, message: "Board not found" };
  }
  return board;
}

export function getColumns(boardId: number): Column[] {
  if (!boardRepository.exists(boardId)) {
    throw { code: "NOT_FOUND" as const, message: "Board not found" };
  }
  return columnRepository.findByBoardId(boardId);
}

export type CreateColumnInput = { title: string; position?: number };

export function createColumn(boardId: number, input: CreateColumnInput): Column {
  if (!boardRepository.exists(boardId)) {
    throw { code: "NOT_FOUND" as const, message: "Board not found" };
  }
  const position = input.position ?? columnRepository.getNextPosition(boardId);
  return columnRepository.create({
    boardId,
    title: input.title,
    position,
  });
}
