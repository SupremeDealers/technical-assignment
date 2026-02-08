import { apiFetch } from "./client";
import { Comment } from "./apiTypes";

export async function getTaskComments(taskId: string): Promise<Comment[]> {
  return apiFetch<Comment[]>(`/tasks/${taskId}/comments`);
}

export async function addTaskComment(
  taskId: string,
  content: string,
): Promise<Comment> {
  return apiFetch<Comment>(`/tasks/${taskId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}
