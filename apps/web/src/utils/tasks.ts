import { apiClient } from "./api-client";

export async function getTasks(boardId: string, q?: string) {
  try {
    const res = await apiClient.get(`/api/boards/${boardId}/tasks`, {
      params: { q },
    });
    return res.data;
  } catch (err) {
    console.error(err);
  }
}

export async function createTask(boardId: string, payload: any) {
  try {
    const res = await apiClient.post(`/api/boards/${boardId}/tasks`, payload);
    return res.data;
  } catch (err) {
    console.error(err);
  }
}

export async function moveTask(id: string, columnId: string) {
  try {
    const res = await apiClient.patch(`/api/tasks/${id}/move`, { columnId });
    return res.data;
  } catch (err) {
    console.error(err);
  }
}
