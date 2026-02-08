import { apiFetch } from "./client";

export interface Task {
  id: string;
  title: string;
  columnId: string;
  _count?: {
    comments: number;
  };
}

export interface TasksResponse {
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getColumnTasks(
  columnId: string,
  params: { search?: string; page?: number; limit?: number } = {},
): Promise<TasksResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", params.page.toString());
  if (params.limit) query.set("limit", params.limit.toString());

  const queryString = query.toString();
  return apiFetch<TasksResponse>(
    `/columns/${columnId}/tasks${queryString ? `?${queryString}` : ""}`,
  );
}

export async function createTask(
  columnId: string,
  title: string,
): Promise<Task> {
  return apiFetch<Task>(`/columns/${columnId}/tasks`, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export async function updateTask(
  taskId: string,
  data: Partial<{ title: string; columnId: string }>,
): Promise<Task> {
  return apiFetch<Task>(`/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteTask(taskId: string): Promise<void> {
  return apiFetch<void>(`/tasks/${taskId}`, {
    method: "DELETE",
  });
}
