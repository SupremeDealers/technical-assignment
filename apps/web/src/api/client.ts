import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
} from "../types/auth.types";
import type {
  Board,
  Column,
  CreateColumnInput,
  UpdateColumnInput,
} from "../types/board.types";
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TasksQuery,
  PaginatedTasks,
  Comment,
  CreateCommentInput,
} from "../types/task.types";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:4000/api"
).replace(/\/$/, "");

class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

class ApiClient {
  private getToken() {
    return localStorage.getItem("token");
  }

  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeoutMs = 15000,
  ): Promise<T> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(!endpoint.startsWith("/auth")),
          ...options.headers,
        },
        signal: controller.signal,
      });

      // 204 No Content
      if (response.status === 204) {
        return undefined as T;
      }

      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");

      const body = isJson ? await response.json().catch(() => null) : null;

      if (!response.ok) {
        const message =
          body?.error?.message || body?.message || "Request failed";

        throw new ApiError(message, response.status, body?.error?.code);
      }

      return body as T;
    } finally {
      clearTimeout(id);
    }
  }

  // ---------- AUTH ----------
  register(data: RegisterInput) {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  login(data: LoginInput) {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ---------- BOARDS ----------
  getBoard(boardId: string) {
    return this.request<Board>(`/boards/${boardId}`);
  }

  getBoardColumns(boardId: string) {
    return this.request<Column[]>(`/boards/${boardId}/columns`);
  }

  createColumn(boardId: string, data: CreateColumnInput) {
    return this.request<Column>(`/boards/${boardId}/columns`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ---------- COLUMNS ----------
  updateColumn(columnId: string, data: UpdateColumnInput) {
    return this.request<Column>(`/columns/${columnId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  deleteColumn(columnId: string) {
    return this.request<void>(`/columns/${columnId}`, {
      method: "DELETE",
    });
  }

  // ---------- TASKS ----------
  getColumnTasks(columnId: string, query?: TasksQuery) {
    const params = new URLSearchParams();

    if (query?.search) params.append("search", query.search);
    if (query?.page) params.append("page", String(query.page));
    if (query?.limit) params.append("limit", String(query.limit));
    if (query?.sort) params.append("sort", query.sort);
    if (query?.order) params.append("order", query.order);

    const qs = params.toString();
    return this.request<PaginatedTasks>(
      `/columns/${columnId}/tasks${qs ? `?${qs}` : ""}`,
    );
  }

  createTask(columnId: string, data: CreateTaskInput) {
    return this.request<Task>(`/columns/${columnId}/tasks`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  updateTask(taskId: string, data: UpdateTaskInput) {
    return this.request<Task>(`/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  deleteTask(taskId: string) {
    return this.request<void>(`/tasks/${taskId}`, {
      method: "DELETE",
    });
  }

  // ---------- COMMENTS ----------
  getTaskComments(taskId: string) {
    return this.request<Comment[]>(`/tasks/${taskId}/comments`);
  }

  createComment(taskId: string, data: CreateCommentInput) {
    return this.request<Comment>(`/tasks/${taskId}/comments`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ---------- HEALTH ----------
  healthCheck() {
    return this.request<{ status: string; timestamp: string }>("/health", {
      // health should not need auth
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const apiClient = new ApiClient();
export { ApiError };
