import { apiFetch } from "./client";
import type { User } from "../types";

export type AuthResponse = {
  user: User;
  boardId?: string;
};

export function register(payload: {
  name: string;
  email: string;
  password: string;
}) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload: { email: string; password: string }) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logout() {
  return apiFetch<{ ok: true }>("/auth/logout", { method: "POST" });
}
