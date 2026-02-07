import { Tasks } from "../types/types";
import { apiClient } from "./api-client";

export async function getTasks(boardId: string, q?: string) {
  try {
    const res = await apiClient.get<Tasks>(`/boards/${boardId}/tasks`, {
      params: { q },
    });
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function createTask(boardId: string, payload: any) {
  try {
    const res = await apiClient.post(`/boards/${boardId}/tasks`, payload);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function moveTask(id: string, columnId: string) {
  const res = await apiClient.patch(`/tasks/${id}/move`, { columnId });
  return res.data;
}
