import { apiClient } from "./api-client";

export async function login(data: { email: string; password: string }) {
  const res = await apiClient.post("/api/auth/login", data);
  return res.data.data;
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
}) {
  const res = await apiClient.post("/api/auth/register", data);
  return res.data.data;
}

export async function me() {
  const res = await apiClient.get("/api/auth/me");
  return res.data.data;
}
