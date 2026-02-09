import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { ApiErrorHandler } from "@/lib/api-error";
import type {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  Board,
  CreateBoardDto,
  Column,
  CreateColumnDto,
  UpdateColumnDto,
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  Comment,
  CreateCommentDto,
  PaginatedResponse,
  ApiError,
  AuthData,
} from "@/types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const TOKEN_KEY = "kanban_token";

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = "/login";
    }

    // Log error for debugging
    if (error.response?.data) {
      ApiErrorHandler.logError(error.response.data);
    }

    return Promise.reject(error);
  },
);

// Token management
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// Auth API
export const authApi = {
  register: async (credentials: RegisterCredentials): Promise<AuthData> => {
    const { data } = await api.post<AuthResponse>(
      "/auth/register",
      credentials,
    );
    setToken(data.data.token);
    return data.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthData> => {
    const { data } = await api.post<AuthResponse>("/auth/login", credentials);

    setToken(data.data.token);
    return data.data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<ApiResponse<User>>("/auth/me");

    return data.data;
  },

  logout: (): void => {
    removeToken();
  },
};

// API Response wrapper for generic endpoints
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// Boards API
export const boardsApi = {
  getAll: async (): Promise<Board[]> => {
    const { data } = await api.get<ApiResponse<Board[]>>("/boards");
    return data.data;
  },

  getById: async (boardId: string): Promise<Board> => {
    const { data } = await api.get<ApiResponse<Board>>(`/boards/${boardId}`);
    return data.data;
  },

  create: async (board: CreateBoardDto): Promise<Board> => {
    const { data } = await api.post<ApiResponse<Board>>("/boards", board);
    return data.data;
  },

  update: async (
    boardId: string,
    board: Partial<CreateBoardDto>,
  ): Promise<Board> => {
    const { data } = await api.put<ApiResponse<Board>>(
      `/boards/${boardId}`,
      board,
    );
    return data.data;
  },

  delete: async (boardId: string): Promise<void> => {
    await api.delete(`/boards/${boardId}`);
  },
};

// Columns API
export const columnsApi = {
  getByBoard: async (boardId: string): Promise<Column[]> => {
    const { data } = await api.get<ApiResponse<Column[]>>(
      `/columns/boards/${boardId}/columns`,
    );
    return data.data;
  },

  create: async (boardId: string, column: CreateColumnDto): Promise<Column> => {
    const { data } = await api.post<ApiResponse<Column>>(
      `/columns/boards/${boardId}/columns`,
      column,
    );
    return data.data;
  },

  update: async (
    columnId: string,
    column: UpdateColumnDto,
  ): Promise<Column> => {
    const { data } = await api.put<ApiResponse<Column>>(
      `/columns/${columnId}`,
      column,
    );
    return data.data;
  },

  delete: async (columnId: string): Promise<void> => {
    await api.delete(`/columns/${columnId}`);
  },
};

// Tasks API
export const tasksApi = {
  getByColumn: async (
    columnId: string,
    page = 1,
    limit = 10,
    search = "",
    sort = "createdAt",
  ): Promise<{
    data: Task[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> => {
    const { data } = await api.get<
      ApiResponse<{ data: Task[]; pagination: any }>
    >(`/tasks/columns/${columnId}`, {
      params: { page, limit, search, sort },
    });
    return data.data;
  },

  // Get tasks for a board with pagination
  getByBoard: async (
    boardId: string,
    page = 1,
    limit = 10,
  ): Promise<{
    data: Task[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> => {
    const { data } = await api.get<
      ApiResponse<{ data: Task[]; pagination: any }>
    >(`/tasks/boards/${boardId}/tasks`, {
      params: { page, limit },
    });
    return data.data;
  },

  create: async (columnId: string, task: CreateTaskDto): Promise<Task> => {
    const { data } = await api.post<ApiResponse<Task>>(
      `/tasks/columns/${columnId}/tasks`,
      task,
    );
    return data.data;
  },

  update: async (taskId: string, task: UpdateTaskDto): Promise<Task> => {
    const { data } = await api.put<ApiResponse<Task>>(`/tasks/${taskId}`, task);
    return data.data;
  },

  // Move task to another column (server handles order)
  move: async (
    taskId: string,
    columnId: string,
    order: number,
  ): Promise<Task> => {
    const { data } = await api.patch<ApiResponse<Task>>(
      `/tasks/${taskId}/move`,
      {
        columnId,
        order,
      },
    );
    return data.data;
  },

  delete: async (taskId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}`);
  },
};

// Comments API
export const commentsApi = {
  getByTask: async (
    taskId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<Comment>> => {
    const { data } = await api.get<
      ApiResponse<{ comments: Comment[]; pagination: any }>
    >(`/comments/tasks/${taskId}/comments`, { params: { page, limit } });

    const payload = data.data;

    const pagination = payload.pagination || {};
    const items = payload.comments ?? [];

    return {
      data: items,
      page: pagination.page ?? page,
      limit: pagination.limit ?? limit,
      total: pagination.total ?? 0,
      totalPages: pagination.totalPages ?? 1,
    };
  },

  create: async (
    taskId: string,
    comment: CreateCommentDto,
  ): Promise<Comment> => {
    const { data } = await api.post<ApiResponse<Comment>>(
      `/comments/tasks/${taskId}/comments`,
      comment,
    );
    return data.data;
  },

  delete: async (taskId: string, commentId: string): Promise<void> => {
    await api.delete(`/comments/tasks/${taskId}/comments/${commentId}`);
  },
};

export default api;
