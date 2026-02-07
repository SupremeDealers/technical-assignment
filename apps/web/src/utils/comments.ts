import { apiClient } from "./api-client";

export async function getComments(taskId: string) {
  const res = await apiClient.get(`/tasks/${taskId}/comments`);
  return res.data;
}

export async function addComment(taskId: string, body: string) {
  const res = await apiClient.post(`/tasks/${taskId}/comments`, { body });
  return res.data.data;
}
