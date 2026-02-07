import { apiFetch } from "./client";
import type { Comment } from "../types";

export function getComments(taskId: string) {
  return apiFetch<Comment[]>(`/tasks/${taskId}/comments`);
}

export function createComment(taskId: string, payload: { body: string }) {
  return apiFetch<Comment>(`/tasks/${taskId}/comments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
