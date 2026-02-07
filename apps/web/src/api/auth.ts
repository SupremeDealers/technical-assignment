import api from './axios';
import { AuthResponse, User } from '../types/auth';


export const loginApi = async (data: any) => {
  const res = await api.post<AuthResponse>('/auth/login', data);
  return res.data; 
};

export const registerApi = async (data: any) => {
  const res = await api.post<AuthResponse>('/auth/register', data);
  return res.data;
};

export const logoutApi = async () => {
  // If you implemented a logout endpoint in backend, call it here.
  // Otherwise, we just rely on client-side cleanup.
  // await api.post('/auth/logout');
};