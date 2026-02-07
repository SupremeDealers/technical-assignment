/// <reference types="vite/client" />
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export async function apiCall<T>(
  endpoint: string,
  options?: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
    token?: string;
  }
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options?.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  const response = await fetch(url, {
    method: options?.method || "GET",
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "API request failed");
  }

  return data;
}

export async function registerUser(email: string, password: string, name: string) {
  return apiCall<{ user: { id: string; email: string; name: string }; token: string }>(
    "/auth/register",
    {
      method: "POST",
      body: { email, password, name },
    }
  );
}

export async function loginUser(email: string, password: string) {
  return apiCall<{ user: { id: string; email: string; name: string }; token: string }>(
    "/auth/login",
    {
      method: "POST",
      body: { email, password },
    }
  );
}

export async function getMeUser(token: string) {
  return apiCall<{ user: { id: string; email: string; name: string } }>(
    "/auth/me",
    { token }
  );
}

export async function getBoards(token: string) {
  return apiCall<{
    boards: Array<{
      id: string;
      title: string;
      columns: Array<{
        id: string;
        title: string;
        position: number;
        tasks: Array<{ id: string; title: string; columnId: string; position: number }>;
      }>;
    }>;
  }>("/boards", { token });
}

export async function getBoard(boardId: string, token: string) {
  return apiCall<{
    board: {
      id: string;
      title: string;
      columns: Array<{
        id: string;
        title: string;
        position: number;
        tasks: Array<{
          id: string;
          title: string;
          description?: string;
          position: number;
          comments: Array<{ id: string; content: string; user: { name: string } }>;
        }>;
      }>;
    };
  }>(`/boards/${boardId}`, { token });
}

export async function createBoard(title: string, token: string) {
  return apiCall<{ board: { id: string; title: string } }>("/boards", {
    method: "POST",
    body: { title },
    token,
  });
}

export async function updateBoard(boardId: string, title: string, token: string) {
  return apiCall<{ board: { id: string; title: string } }>(
    `/boards/${boardId}`,
    {
      method: "PUT",
      body: { title },
      token,
    }
  );
}

export async function deleteBoard(boardId: string, token: string) {
  return apiCall<{ success: boolean }>(`/boards/${boardId}`, {
    method: "DELETE",
    token,
  });
}

export async function createColumn(boardId: string, title: string, token: string) {
  return apiCall<{ column: { id: string; title: string; position: number } }>(
    `/boards/${boardId}/columns`,
    {
      method: "POST",
      body: { title },
      token,
    }
  );
}

export async function updateColumn(columnId: string, title: string, position: number, token: string) {
  return apiCall<{ column: { id: string; title: string; position: number } }>(
    `/columns/${columnId}`,
    {
      method: "PUT",
      body: { title, position },
      token,
    }
  );
}

export async function deleteColumn(columnId: string, token: string) {
  return apiCall<{ success: boolean }>(`/columns/${columnId}`, {
    method: "DELETE",
    token,
  });
}

export async function createTask(
  boardId: string,
  title: string,
  columnId: string,
  description?: string,
  token?: string
) {
  return apiCall<{ task: { id: string; title: string; columnId: string; position: number } }>(
    `/boards/${boardId}/tasks`,
    {
      method: "POST",
      body: { title, columnId, description },
      token,
    }
  );
}

export async function getTasksForBoard(boardId: string, search = "", page = 1, token?: string) {
  return apiCall<{
    tasks: Array<{ id: string; title: string; description?: string }>;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>(`/boards/${boardId}/tasks?search=${encodeURIComponent(search)}&page=${page}`, { token });
}

export async function getTask(taskId: string, token: string) {
  return apiCall<{
    task: {
      id: string;
      title: string;
      description?: string;
      columnId: string;
      comments: Array<{ id: string; content: string; user: { name: string } }>;
    };
  }>(`/tasks/${taskId}`, { token });
}

export async function updateTask(
  taskId: string,
  updates: {
    title?: string;
    description?: string;
    columnId?: string;
    position?: number;
  },
  token: string
) {
  return apiCall<{ task: { id: string; title: string } }>(`/tasks/${taskId}`, {
    method: "PUT",
    body: updates,
    token,
  });
}

export async function deleteTask(taskId: string, token: string) {
  return apiCall<{ success: boolean }>(`/tasks/${taskId}`, {
    method: "DELETE",
    token,
  });
}

export async function createComment(taskId: string, content: string, token: string) {
  return apiCall<{ comment: { id: string; content: string; user: { name: string } } }>(
    `/tasks/${taskId}/comments`,
    {
      method: "POST",
      body: { content },
      token,
    }
  );
}

export async function getTaskComments(taskId: string, token: string) {
  return apiCall<{
    comments: Array<{ id: string; content: string; user: { name: string } }>;
  }>(`/tasks/${taskId}/comments`, { token });
}

export async function updateComment(commentId: string, content: string, token: string) {
  return apiCall<{ comment: { id: string; content: string } }>(`/comments/${commentId}`, {
    method: "PUT",
    body: { content },
    token,
  });
}

export async function deleteComment(commentId: string, token: string) {
  return apiCall<{ success: boolean }>(`/comments/${commentId}`, {
    method: "DELETE",
    token,
  });
}
