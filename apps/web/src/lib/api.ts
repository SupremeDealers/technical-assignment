const API_URL = "http://localhost:4000";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "An error occurred");
  }

  return data;
}

export const api = {
  // Auth
  register: async (data: { email: string; password: string; name: string }) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<{ user: import("../types").User; token: string }>(
      res
    );
  },

  login: async (data: { email: string; password: string }) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<{ user: import("../types").User; token: string }>(
      res
    );
  },

  me: async () => {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ user: import("../types").User }>(res);
  },

  // Boards
  getBoards: async () => {
    const res = await fetch(`${API_URL}/boards`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ boards: import("../types").Board[] }>(res);
  },

  getBoard: async (boardId: string) => {
    const res = await fetch(`${API_URL}/boards/${boardId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ board: import("../types").Board }>(res);
  },

  createBoard: async (data: { name: string }) => {
    const res = await fetch(`${API_URL}/boards`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ board: import("../types").Board }>(res);
  },

  deleteBoard: async (boardId: string) => {
    const res = await fetch(`${API_URL}/boards/${boardId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error?.message || "Failed to delete board");
    }
  },

  // Columns
  getBoardColumns: async (boardId: string) => {
    const res = await fetch(`${API_URL}/boards/${boardId}/columns`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ columns: import("../types").Column[] }>(res);
  },

  createColumn: async (boardId: string, data: { name: string }) => {
    const res = await fetch(`${API_URL}/boards/${boardId}/columns`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ column: import("../types").Column }>(res);
  },

  updateColumn: async (
    columnId: string,
    data: { name?: string; order?: number }
  ) => {
    const res = await fetch(`${API_URL}/columns/${columnId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ column: import("../types").Column }>(res);
  },

  deleteColumn: async (columnId: string) => {
    const res = await fetch(`${API_URL}/columns/${columnId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error?.message || "Failed to delete column");
    }
  },

  // Tasks
  getBoardTasks: async (boardId: string) => {
    const res = await fetch(`${API_URL}/boards/${boardId}/tasks`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ tasks: import("../types").Task[] }>(res);
  },

  getColumnTasks: async (
    columnId: string,
    params?: { search?: string; page?: number; limit?: number; sort?: string }
  ) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.sort) searchParams.set("sort", params.sort);

    const res = await fetch(
      `${API_URL}/columns/${columnId}/tasks?${searchParams}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse<import("../types").PaginatedResponse<import("../types").Task>>(
      res
    );
  },

  getTask: async (taskId: string) => {
    const res = await fetch(`${API_URL}/tasks/${taskId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ task: import("../types").Task }>(res);
  },

  createTask: async (
    columnId: string,
    data: { title: string; description?: string; priority?: string }
  ) => {
    const res = await fetch(`${API_URL}/columns/${columnId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ task: import("../types").Task }>(res);
  },

  updateTask: async (
    taskId: string,
    data: {
      title?: string;
      description?: string;
      priority?: string;
      columnId?: string;
      order?: number;
    }
  ) => {
    const res = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ task: import("../types").Task }>(res);
  },

  deleteTask: async (taskId: string) => {
    const res = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error?.message || "Failed to delete task");
    }
  },

  // Comments
  getComments: async (taskId: string) => {
    const res = await fetch(`${API_URL}/tasks/${taskId}/comments`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ comments: import("../types").Comment[] }>(res);
  },

  createComment: async (taskId: string, data: { content: string }) => {
    const res = await fetch(`${API_URL}/tasks/${taskId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ comment: import("../types").Comment }>(res);
  },

  deleteComment: async (commentId: string) => {
    const res = await fetch(`${API_URL}/comments/${commentId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error?.message || "Failed to delete comment");
    }
  },
};
