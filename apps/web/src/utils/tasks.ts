import { Tasks } from "../types/types";
import { apiClient } from "./api-client";

export async function getTasks(
  boardId: string,
  page: number,
  limit: number,
  search?: string,
) {
  try {
    const res = await apiClient.get<Tasks>(`/boards/${boardId}/tasks`, {
      params: { page, limit, search },
    });
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function createTask(
  boardId: string,
  payload: {
    title: string;
    description: string | undefined;
    columnId: string;
  },
) {
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

export async function deleteTask(id: string) {
  const res = await apiClient.delete(`/tasks/${id}/delete`);
  return res.data;
}
