import { Board, Column } from "./apiTypes";
import { apiFetch } from "./client";

export async function getBoards(): Promise<Board[]> {
  return apiFetch<Board[]>("/boards");
}

export async function getBoard(id: string): Promise<Board> {
  return apiFetch<Board>(`/boards/${id}`);
}

export async function getBoardColumns(boardId: string): Promise<Column[]> {
  return apiFetch<Column[]>(`/boards/${boardId}/columns`);
}
