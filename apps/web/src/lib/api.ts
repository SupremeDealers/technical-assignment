const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error?.message || "Request failed",
      response.status,
      errorData.error?.code || "UNKNOWN_ERROR"
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data: { email: string; password: string; name: string }) =>
    request<{ user: { id: number; email: string; name: string }; token: string }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),

  login: (data: { email: string; password: string }) =>
    request<{ user: { id: number; email: string; name: string }; token: string }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),

  // Boards
  getBoard: (boardId: number, token: string) =>
    request<{
      id: number;
      title: string;
      description: string | null;
      createdBy: { id: number; name: string; email: string };
      createdAt: string;
      updatedAt: string;
    }>(`/boards/${boardId}`, { token }),

  getBoardColumns: (boardId: number, token: string) =>
    request<{
      columns: Array<{
        id: number;
        boardId: number;
        title: string;
        position: number;
        taskCount: number;
        createdAt: string;
        updatedAt: string;
      }>;
    }>(`/boards/${boardId}/columns`, { token }),

  createColumn: (
    boardId: number,
    data: { title: string; position?: number },
    token: string
  ) =>
    request<{
      id: number;
      boardId: number;
      title: string;
      position: number;
      taskCount: number;
      createdAt: string;
      updatedAt: string;
    }>(`/boards/${boardId}/columns`, {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  // Columns
  updateColumn: (
    columnId: number,
    data: { title?: string; position?: number },
    token: string
  ) =>
    request(`/columns/${columnId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      token,
    }),

  deleteColumn: (columnId: number, token: string) =>
    request(`/columns/${columnId}`, {
      method: "DELETE",
      token,
    }),

  // Tasks
  getColumnTasks: (
    columnId: number,
    params: {
      search?: string;
      page?: number;
      limit?: number;
      sort?: "createdAt" | "priority";
    },
    token: string
  ) => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set("search", params.search);
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.sort) searchParams.set("sort", params.sort);

    return request<{
      tasks: Array<{
        id: number;
        columnId: number;
        title: string;
        description: string | null;
        priority: string;
        createdBy: { id: number; name: string; email: string };
        assignedTo: { id: number; name: string; email: string } | null;
        createdAt: string;
        updatedAt: string;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/columns/${columnId}/tasks?${searchParams}`, { token });
  },

  createTask: (
    columnId: number,
    data: {
      title: string;
      description?: string;
      priority?: "low" | "medium" | "high";
      assignedTo?: number;
    },
    token: string
  ) =>
    request(`/columns/${columnId}/tasks`, {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  updateTask: (
    taskId: number,
    data: {
      title?: string;
      description?: string | null;
      priority?: "low" | "medium" | "high";
      assignedTo?: number | null;
      columnId?: number;
    },
    token: string
  ) =>
    request(`/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      token,
    }),

  deleteTask: (taskId: number, token: string) =>
    request(`/tasks/${taskId}`, {
      method: "DELETE",
      token,
    }),

  // Comments
  getTaskComments: (taskId: number, token: string) =>
    request<{
      comments: Array<{
        id: number;
        taskId: number;
        content: string;
        user: { id: number; name: string; email: string };
        createdAt: string;
        updatedAt: string;
      }>;
    }>(`/tasks/${taskId}/comments`, { token }),

  createComment: (taskId: number, data: { content: string }, token: string) =>
    request(`/tasks/${taskId}/comments`, {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),
};

export { ApiError };
