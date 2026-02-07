const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Board {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface Column {
  id: number;
  boardId: number;
  name: string;
  position: number;
  taskCount: number;
  createdAt: Date;
}

export interface Task {
  id: number;
  columnId: number;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  position: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: User;
}

export interface Comment {
  id: number;
  taskId: number;
  content: string;
  createdAt: Date;
  user: User;
}

export interface PaginatedTasks {
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem("token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Request failed");
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getBoard(boardId: number): Promise<Board> {
    return this.request<Board>(`/boards/${boardId}`);
  }

  async getBoardColumns(boardId: number): Promise<Column[]> {
    return this.request<Column[]>(`/boards/${boardId}/columns`);
  }

  async createColumn(boardId: number, name: string): Promise<Column> {
    return this.request<Column>(`/boards/${boardId}/columns`, {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  async updateColumn(columnId: number, data: { name?: string; position?: number }): Promise<Column> {
    return this.request<Column>(`/columns/${columnId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteColumn(columnId: number): Promise<void> {
    return this.request<void>(`/columns/${columnId}`, {
      method: "DELETE",
    });
  }

  async getColumnTasks(
    columnId: number,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      sort?: "createdAt" | "priority";
    } = {}
  ): Promise<PaginatedTasks> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set("page", params.page.toString());
    if (params.limit) queryParams.set("limit", params.limit.toString());
    if (params.search) queryParams.set("search", params.search);
    if (params.sort) queryParams.set("sort", params.sort);

    return this.request<PaginatedTasks>(`/tasks/${columnId}/tasks?${queryParams}`);
  }

  async createTask(
    columnId: number,
    data: {
      title: string;
      description?: string;
      priority?: "low" | "medium" | "high";
    }
  ): Promise<Task> {
    return this.request<Task>(`/tasks/${columnId}/tasks`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTask(
    taskId: number,
    data: {
      title?: string;
      description?: string;
      priority?: "low" | "medium" | "high";
      columnId?: number;
      position?: number;
    }
  ): Promise<Task> {
    return this.request<Task>(`/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteTask(taskId: number): Promise<void> {
    return this.request<void>(`/tasks/${taskId}`, {
      method: "DELETE",
    });
  }

  async getTaskComments(taskId: number): Promise<Comment[]> {
    return this.request<Comment[]>(`/tasks/${taskId}/comments`);
  }

  async createComment(taskId: number, content: string): Promise<Comment> {
    return this.request<Comment>(`/tasks/${taskId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  }
}

export const api = new ApiClient();
