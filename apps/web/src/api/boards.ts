import { apiFetch } from "./client";
import type { Board, Column } from "../types";

export function getBoard(boardId: string) {
  return apiFetch<Board>(`/boards/${boardId}`);
}

export function getColumns(boardId: string) {
  return apiFetch<Column[]>(`/boards/${boardId}/columns`);
}

export function createColumn(boardId: string, payload: { title: string }) {
  return apiFetch<Column>(`/boards/${boardId}/columns`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
