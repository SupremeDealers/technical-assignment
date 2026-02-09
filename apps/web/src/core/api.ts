export interface User {
  id: string;
  username: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  userId: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
}

export const API_BASE = "http://localhost:4000";

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    const error = await res.json();
    throw new Error(error.error?.message || "Something went wrong");
  }
  if (res.status === 204) return null;
  return res.json();
};
