import type { ApiError, User, Board, Column, Task, Comment } from "../types";

export type { ApiError, User, Board, Column, Task, Comment };

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

function getToken(): string | null {
  return localStorage.getItem("token");
}

export async function api<T>(
  path: string,
  options: globalThis.RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token = getToken(), ...init } = options;
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && (init.body as string)?.startsWith?.("{")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, ...data } as { status: number } & ApiError;
  return data as T;
}

export const auth = {
  register: (body: { email: string; password: string; name: string }) =>
    api<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
      token: null,
    }),
  login: (body: { email: string; password: string }) =>
    api<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
      token: null,
    }),
};

export const boards = {
  get: (boardId: number) => api<Board>(`/boards/${boardId}`),
  getColumns: (boardId: number) => api<Column[]>(`/boards/${boardId}/columns`),
  createColumn: (boardId: number, body: { title: string; position?: number }) =>
    api<Column>(`/boards/${boardId}/columns`, { method: "POST", body: JSON.stringify(body) }),
};

export const columns = {
  patch: (columnId: number, body: { title?: string; position?: number }) =>
    api<Column>(`/columns/${columnId}`, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (columnId: number) =>
    api<void>(`/columns/${columnId}`, { method: "DELETE" }),
  getTasks: (columnId: number, params?: { search?: string; page?: number; limit?: number; sort?: "createdAt" | "priority" }) => {
    const sp = new URLSearchParams();
    if (params?.search) sp.set("search", params.search);
    if (params?.page) sp.set("page", String(params.page));
    if (params?.limit) sp.set("limit", String(params.limit));
    if (params?.sort) sp.set("sort", params.sort);
    const q = sp.toString();
    return api<{ tasks: Task[]; total: number; page: number; limit: number; totalPages: number }>(
      `/columns/${columnId}/tasks${q ? `?${q}` : ""}`
    );
  },
  createTask: (columnId: number, body: { title: string; description?: string; priority?: string }) =>
    api<Task>(`/columns/${columnId}/tasks`, { method: "POST", body: JSON.stringify(body) }),
};

export const tasks = {
  get: (taskId: number) => api<Task>(`/tasks/${taskId}`),
  patch: (taskId: number, body: { title?: string; description?: string | null; priority?: string; columnId?: number }) =>
    api<Task>(`/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (taskId: number) => api<void>(`/tasks/${taskId}`, { method: "DELETE" }),
  getComments: (taskId: number) => api<Comment[]>(`/tasks/${taskId}/comments`),
  addComment: (taskId: number, body: { body: string }) =>
    api<Comment>(`/tasks/${taskId}/comments`, { method: "POST", body: JSON.stringify(body) }),
};
