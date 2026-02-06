import axios from "axios";

const API_BASE_URL = "http://localhost:4000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authAPI = {
  login: (data: LoginData): Promise<AuthResponse> =>
    apiClient.post("/auth/login", data).then((res) => res.data),
  register: (data: RegisterData): Promise<AuthResponse> =>
    apiClient.post("/auth/register", data).then((res) => res.data),
};

// Board API
export interface Board {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

export interface Column {
  id: number;
  name: string;
  boardId: number;
  position: number;
  createdAt: string;
}

export const boardAPI = {
  getBoard: (boardId: number): Promise<Board> =>
    apiClient.get(`/boards/${boardId}`).then((res) => res.data),
  getColumns: (boardId: number): Promise<Column[]> =>
    apiClient.get(`/boards/${boardId}/columns`).then((res) => res.data),
  createColumn: (boardId: number, name: string): Promise<Column> =>
    apiClient.post(`/boards/${boardId}/columns`, { name }).then((res) => res.data),
};

// Column API
export const columnAPI = {
  updateColumn: (columnId: number, data: Partial<Column>): Promise<Column> =>
    apiClient.patch(`/columns/${columnId}`, data).then((res) => res.data),
  deleteColumn: (columnId: number): Promise<Column> =>
    apiClient.delete(`/columns/${columnId}`).then((res) => res.data),
};

// Task API
export interface Task {
  id: number;
  title: string;
  description: string;
  columnId: number;
  userId: number;
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
}

export interface TaskSearchParams {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface TaskResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const taskAPI = {
  getTasks: (columnId: number, params: TaskSearchParams): Promise<TaskResponse> =>
    apiClient.get(`/tasks/columns/${columnId}/tasks`, { params }).then((res) => res.data),
  createTask: (columnId: number, data: Partial<Task>): Promise<Task> =>
    apiClient.post(`/tasks/columns/${columnId}/tasks`, data).then((res) => res.data),
  updateTask: (taskId: number, data: Partial<Task>): Promise<Task> =>
    apiClient.patch(`/tasks/${taskId}`, data).then((res) => res.data),
  deleteTask: (taskId: number): Promise<Task> =>
    apiClient.delete(`/tasks/${taskId}`).then((res) => res.data),
};

// Comment API
export interface Comment {
  id: number;
  content: string;
  taskId: number;
  userId: number;
  createdAt: string;
}

export const commentAPI = {
  getComments: (taskId: number): Promise<Comment[]> =>
    apiClient.get(`/comments/tasks/${taskId}/comments`).then((res) => res.data),
  createComment: (taskId: number, content: string): Promise<Comment> =>
    apiClient.post(`/comments/tasks/${taskId}/comments`, { content }).then((res) => res.data),
};
