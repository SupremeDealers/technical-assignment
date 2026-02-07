import { apiFetch } from "./client";
import type { Task, TaskList } from "../types";

export function getTasks(
  columnId: string,
  params: { search?: string; page?: number; limit?: number; sort?: string }
) {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.sort) qs.set("sort", params.sort);
  const query = qs.toString();
  return apiFetch<TaskList>(`/columns/${columnId}/tasks${query ? `?${query}` : ""}`);
}

export function createTask(
  columnId: string,
  payload: { title: string; description?: string; priority?: number }
) {
  return apiFetch<Task>(`/columns/${columnId}/tasks`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTask(
  taskId: string,
  payload: {
    title?: string;
    description?: string;
    priority?: number;
    columnId?: string;
  }
) {
  return apiFetch<Task>(`/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteTask(taskId: string) {
  return apiFetch<{ ok: true }>(`/tasks/${taskId}`, { method: "DELETE" });
}
