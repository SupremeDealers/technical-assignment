const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface FetchOptions {
  method?: string;
  body?: string;
  headers?: Record<string, string>;
}

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public error: ApiError
  ) {
    super(error.message);
    this.name = "ApiClientError";
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: FetchOptions
): Promise<T> {
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new ApiClientError(response.status, errorData.error);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Auth
export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    fetchApi<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    fetchApi<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => fetchApi<User>("/auth/me"),
};

// Boards
export interface Board {
  id: number;
  name: string;
  description: string | null;
  owner_id: number;
  created_at: string;
}

export interface Column {
  id: number;
  board_id: number;
  name: string;
  position: number;
  created_at: string;
  task_count?: number;
}

export const boardsApi = {
  getAll: () => fetchApi<Board[]>("/boards"),
  
  getById: (id: number) => fetchApi<Board>(`/boards/${id}`),
  
  create: (data: { name: string; description?: string }) =>
    fetchApi<Board>("/boards", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getColumns: (boardId: number) =>
    fetchApi<Column[]>(`/boards/${boardId}/columns`),

  createColumn: (boardId: number, data: { name: string }) =>
    fetchApi<Column>(`/boards/${boardId}/columns`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Columns
export const columnsApi = {
  update: (id: number, data: { name?: string; position?: number }) =>
    fetchApi<Column>(`/columns/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchApi<void>(`/columns/${id}`, {
      method: "DELETE",
    }),

  getTasks: (
    columnId: number,
    params?: {
      search?: string;
      page?: number;
      limit?: number;
      sort?: "createdAt" | "priority" | "title";
    }
  ) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.sort) searchParams.set("sort", params.sort);

    return fetchApi<{
      tasks: Task[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/columns/${columnId}/tasks?${searchParams}`);
  },

  createTask: (
    columnId: number,
    data: {
      title: string;
      description?: string;
      priority?: "low" | "medium" | "high";
    }
  ) =>
    fetchApi<Task>(`/columns/${columnId}/tasks`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Tasks
export interface Task {
  id: number;
  column_id: number;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high";
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  task_id: number;
  user_id: number;
  content: string;
  created_at: string;
  user_name: string;
  user_email: string;
}

export const tasksApi = {
  getById: (id: number) => fetchApi<Task>(`/tasks/${id}`),

  update: (
    id: number,
    data: {
      title?: string;
      description?: string;
      priority?: "low" | "medium" | "high";
      position?: number;
      column_id?: number;
    }
  ) =>
    fetchApi<Task>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchApi<void>(`/tasks/${id}`, {
      method: "DELETE",
    }),

  getComments: (taskId: number) =>
    fetchApi<Comment[]>(`/tasks/${taskId}/comments`),

  createComment: (taskId: number, data: { content: string }) =>
    fetchApi<Comment>(`/tasks/${taskId}/comments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
