const API_BASE = "http://localhost:4000";

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem("token");
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) ?? {}),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      throw {
        status: res.status,
        ...data.error,
      };
    }

    return data;
  }

  // Auth
  async register(username: string, email: string, password: string) {
    const data = await this.request<{ user: any; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request<{ user: any; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  logout() {
    this.setToken(null);
  }

  // Boards
  async getBoards() {
    return this.request<{ boards: any[] }>("/boards");
  }

  async createBoard(name: string) {
    return this.request<{ board: any }>("/boards", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  async getBoard(boardId: number) {
    return this.request<{ board: any }>(`/boards/${boardId}`);
  }

  async getColumns(boardId: number) {
    return this.request<{ columns: any[] }>(`/boards/${boardId}/columns`);
  }

  async createColumn(boardId: number, name: string) {
    return this.request<{ column: any }>(`/boards/${boardId}/columns`, {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  // Columns
  async updateColumn(columnId: number, data: { name?: string; position?: number }) {
    return this.request<{ column: any }>(`/columns/${columnId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteColumn(columnId: number) {
    return this.request<{ ok: boolean }>(`/columns/${columnId}`, {
      method: "DELETE",
    });
  }

  // Tasks
  async getTasks(columnId: number, params?: { search?: string; page?: number; limit?: number; sort?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.sort) query.set("sort", params.sort);
    const qs = query.toString();
    return this.request<{ tasks: any[]; pagination: any }>(`/columns/${columnId}/tasks${qs ? `?${qs}` : ""}`);
  }

  async getTask(taskId: number) {
    return this.request<{ task: any }>(`/tasks/${taskId}`);
  }

  async createTask(columnId: number, data: { title: string; description?: string; priority?: string; assignee_id?: number }) {
    return this.request<{ task: any }>(`/columns/${columnId}/tasks`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTask(taskId: number, data: { title?: string; description?: string; priority?: string; column_id?: number; position?: number }) {
    return this.request<{ task: any }>(`/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteTask(taskId: number) {
    return this.request<{ ok: boolean }>(`/tasks/${taskId}`, {
      method: "DELETE",
    });
  }

  // Comments
  async getComments(taskId: number) {
    return this.request<{ comments: any[] }>(`/tasks/${taskId}/comments`);
  }

  async createComment(taskId: number, body: string) {
    return this.request<{ comment: any }>(`/tasks/${taskId}/comments`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  }
}

export const api = new ApiClient();
