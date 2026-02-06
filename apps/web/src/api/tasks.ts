
import { api } from './client';

export interface Task {
  id: number;
  columnId: number;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  order: number;
  createdAt: string;
}

export interface Column {
  id: number;
  title: string;
  boardId: number;
  order: number;
  tasks?: Task[];
}

export interface Board {
  id: number;
  name: string;
  columns: Column[];
}

export const getMyBoard = async () => {
  const res = await api.get<Board>('/boards/me');
  return res.data;
};

export const getTasks = async (columnId: number) => {
  const res = await api.get<Task[]>(`/columns/${columnId}/tasks`);
  return res.data;
};

export const createTask = async (columnId: number, data: { title: string; priority: string; description?: string }) => {
  const res = await api.post<Task>(`/columns/${columnId}/tasks`, data);
  return res.data;
};

export const updateTask = async (taskId: number, data: Partial<Task>) => {
  const res = await api.patch<Task>(`/tasks/${taskId}`, data);
  return res.data;
};

export const deleteTask = async (taskId: number) => {
  await api.delete(`/tasks/${taskId}`);
};