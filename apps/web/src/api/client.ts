const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export class ApiError extends Error {
  code: string;
  details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = (await response.json()) as ApiErrorResponse;
    throw new ApiError(data.error.code, data.error.message, data.error.details);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

function getHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export interface UserPublic {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface AuthResponse {
  user: UserPublic;
  token: string;
}

export async function register(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email, password, name }),
  });
  return handleResponse<AuthResponse>(response);
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<AuthResponse>(response);
}

export async function getMe(token: string): Promise<{ user: UserPublic }> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getHeaders(token),
  });
  return handleResponse<{ user: UserPublic }>(response);
}

export interface Board {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface ColumnWithTaskCount {
  id: string;
  board_id: string;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
  task_count: number;
}

export interface BoardWithDetails extends Board {
  owner: UserPublic;
  columns: ColumnWithTaskCount[];
}

export async function getBoards(token: string): Promise<{ boards: Board[] }> {
  const response = await fetch(`${API_BASE_URL}/boards`, {
    headers: getHeaders(token),
  });
  return handleResponse<{ boards: Board[] }>(response);
}

export async function getBoard(token: string, boardId: string): Promise<{ board: BoardWithDetails }> {
  const response = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
    headers: getHeaders(token),
  });
  return handleResponse<{ board: BoardWithDetails }>(response);
}

export async function createBoard(
  token: string,
  data: { name: string; description?: string }
): Promise<{ board: Board }> {
  const response = await fetch(`${API_BASE_URL}/boards`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse<{ board: Board }>(response);
}

export async function updateBoard(
  token: string,
  boardId: string,
  data: { name?: string; description?: string }
): Promise<{ board: Board }> {
  const response = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse<{ board: Board }>(response);
}

export async function deleteBoard(token: string, boardId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  return handleResponse<void>(response);
}

export interface Column {
  id: string;
  board_id: string;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export async function getColumns(
  token: string,
  boardId: string
): Promise<{ columns: ColumnWithTaskCount[] }> {
  const response = await fetch(`${API_BASE_URL}/boards/${boardId}/columns`, {
    headers: getHeaders(token),
  });
  return handleResponse<{ columns: ColumnWithTaskCount[] }>(response);
}

export async function createColumn(
  token: string,
  boardId: string,
  data: { name: string; position?: number }
): Promise<{ column: Column }> {
  const response = await fetch(`${API_BASE_URL}/boards/${boardId}/columns`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse<{ column: Column }>(response);
}

export async function updateColumn(
  token: string,
  columnId: string,
  data: { name?: string; position?: number }
): Promise<{ column: Column }> {
  const response = await fetch(`${API_BASE_URL}/columns/${columnId}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse<{ column: Column }>(response);
}

export async function deleteColumn(token: string, columnId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/columns/${columnId}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  return handleResponse<void>(response);
}

export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  priority: Priority;
  position: number;
  assignee_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TaskWithDetails extends Task {
  assignee: UserPublic | null;
  creator: UserPublic;
  comment_count: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TaskQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  sort?: "createdAt" | "priority" | "position";
  order?: "asc" | "desc";
}

export async function getTasks(
  token: string,
  columnId: string,
  params?: TaskQueryParams
): Promise<PaginatedResponse<TaskWithDetails>> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.sort) searchParams.set("sort", params.sort);
  if (params?.order) searchParams.set("order", params.order);

  const queryString = searchParams.toString();
  const url = `${API_BASE_URL}/columns/${columnId}/tasks${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    headers: getHeaders(token),
  });
  return handleResponse<PaginatedResponse<TaskWithDetails>>(response);
}

export async function getTask(token: string, taskId: string): Promise<{ task: TaskWithDetails }> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    headers: getHeaders(token),
  });
  return handleResponse<{ task: TaskWithDetails }>(response);
}

export async function createTask(
  token: string,
  columnId: string,
  data: {
    title: string;
    description?: string;
    priority?: Priority;
    assignee_id?: string | null;
    position?: number;
  }
): Promise<{ task: TaskWithDetails }> {
  const response = await fetch(`${API_BASE_URL}/columns/${columnId}/tasks`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse<{ task: TaskWithDetails }>(response);
}

export async function updateTask(
  token: string,
  taskId: string,
  data: {
    title?: string;
    description?: string | null;
    priority?: Priority;
    assignee_id?: string | null;
    column_id?: string;
    position?: number;
  }
): Promise<{ task: TaskWithDetails }> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse<{ task: TaskWithDetails }>(response);
}

export async function deleteTask(token: string, taskId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  return handleResponse<void>(response);
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CommentWithUser extends Comment {
  user: UserPublic;
}

export async function getComments(
  token: string,
  taskId: string
): Promise<{ comments: CommentWithUser[] }> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/comments`, {
    headers: getHeaders(token),
  });
  return handleResponse<{ comments: CommentWithUser[] }>(response);
}

export async function createComment(
  token: string,
  taskId: string,
  content: string
): Promise<{ comment: CommentWithUser }> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/comments`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ content }),
  });
  return handleResponse<{ comment: CommentWithUser }>(response);
}

export async function updateComment(
  token: string,
  commentId: string,
  content: string
): Promise<{ comment: CommentWithUser }> {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify({ content }),
  });
  return handleResponse<{ comment: CommentWithUser }>(response);
}

export async function deleteComment(token: string, commentId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  return handleResponse<void>(response);
}
