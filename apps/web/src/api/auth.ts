
import { api } from './client';

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
  };
}

export const login = async (data: { email: string; password: string }) => {
  const res = await api.post<AuthResponse>('/auth/login', data);
  return res.data;
};

export const register = async (data: { email: string; password: string }) => {
  const res = await api.post<AuthResponse>('/auth/register', data);
  return res.data;
};