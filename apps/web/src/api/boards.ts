import { apiFetch } from "./client";

export interface Board {
  id: string;
  name: string;
}

export interface Column {
  id: string;
  title: string;
  order: number;
}

export async function getBoards(): Promise<Board[]> {
  return apiFetch<Board[]>("/boards");
}

export async function getBoard(id: string): Promise<Board> {
  return apiFetch<Board>(`/boards/${id}`);
}

export async function getBoardColumns(boardId: string): Promise<Column[]> {
  return apiFetch<Column[]>(`/boards/${boardId}/columns`);
}
