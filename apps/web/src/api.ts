const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

let authToken: string | null = localStorage.getItem("token");

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

export const getAuthToken = () => authToken;

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export const apiCall = async <T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> => {
  const { requireAuth = true, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers || {});

  if (!headers.has("Content-Type") && fetchOptions.body) {
    headers.set("Content-Type", "application/json");
  }

  if (requireAuth && authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
};

// Auth endpoints
export const authAPI = {
  register: (email: string, password: string) =>
    apiCall<{ id: string; email: string; token: string }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
        requireAuth: false,
      }
    ),

  login: (email: string, password: string) =>
    apiCall<{ id: string; email: string; token: string }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
        requireAuth: false,
      }
    ),
};

// Board endpoints
export const boardAPI = {
  list: () => apiCall("/boards"),
  get: (boardId: string) => apiCall(`/boards/${boardId}`),
  create: (name: string) =>
    apiCall("/boards", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
};

// Column endpoints
export const columnAPI = {
  list: (boardId: string) =>
    apiCall(`/boards/${boardId}/columns`),
  create: (boardId: string, name: string) =>
    apiCall(`/boards/${boardId}/columns`, {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  update: (boardId: string, columnId: string, data: any) =>
    apiCall(`/boards/${boardId}/columns/${columnId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (boardId: string, columnId: string) =>
    apiCall(`/boards/${boardId}/columns/${columnId}`, {
      method: "DELETE",
    }),
};

// Task endpoints
export const taskAPI = {
  list: (columnId: string, search?: string, page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());
    return apiCall(
      `/columns/${columnId}/tasks${params.toString() ? `?${params}` : ""}`
    );
  },
  create: (columnId: string, title: string, description?: string) =>
    apiCall(`/columns/${columnId}/tasks`, {
      method: "POST",
      body: JSON.stringify({ title, description }),
    }),
  update: (taskId: string, data: any) =>
    apiCall(`/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (taskId: string) =>
    apiCall(`/tasks/${taskId}`, {
      method: "DELETE",
    }),
};

// Comment endpoints
export const commentAPI = {
  list: (taskId: string) => apiCall(`/tasks/${taskId}/comments`),
  create: (taskId: string, content: string) =>
    apiCall(`/tasks/${taskId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
};
