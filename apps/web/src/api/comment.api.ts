import { api } from "./axios";

export async function getComments(taskId: number) {
  const { data } = await api.get(`/comments/task/${taskId}`);
  return data;
}

export async function addComment(taskId: number, content: string) {
  const { data } = await api.post(`/comments/task/${taskId}`, { content });
  return data;
}

export async function deleteComment(commentId: number) {
  const { data } = await api.delete(`/comments/delete/${commentId}`);
  return data;
}
