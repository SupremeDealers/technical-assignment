import { apiClient } from "./api-client";

export async function login(data: { email: string; password: string }) {
  const res = await apiClient.post("/auth/login", data);
  return res.data.data;
}

export async function signup(data: {
  name: string;
  email: string;
  password: string;
}) {
  const res = await apiClient.post("/auth/register", data);
  return res.data;
}

export async function me() {
  const res = await apiClient.get("/auth/me");
  return res.data;
}
