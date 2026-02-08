import { apiFetch } from "./client";
import { TasksResponse, Task } from "./apiTypes";

export async function getColumnTasks(
  columnId: string,
  params: {
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
  } = {},
): Promise<TasksResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", params.page.toString());
  if (params.limit) query.set("limit", params.limit.toString());
  if (params.sort) query.set("sort", params.sort);

  const queryString = query.toString();
  return apiFetch<TasksResponse>(
    `/columns/${columnId}/tasks${queryString ? `?${queryString}` : ""}`,
  );
}

export async function createTask(
  columnId: string,
  data: {
    title: string;
    description?: string;
    priority?: string;
    userId?: string | null;
  },
): Promise<Task> {
  return apiFetch<Task>(`/columns/${columnId}/tasks`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTask(
  taskId: string,
  data: Partial<{
    title: string;
    description: string;
    priority: string;
    columnId: string;
    userId: string | null;
  }>,
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
