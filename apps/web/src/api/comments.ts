import { apiFetch } from "./client";

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    email: string;
  };
}

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
