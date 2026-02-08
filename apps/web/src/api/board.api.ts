import { api } from "./axios";

export async function getBoard(boardId: number) {
  return (await api.get(`/boards/${boardId}`)).data;
}

export async function getColumns(boardId: number) {
  return (await api.get(`/boards/${boardId}/columns`)).data;
}
