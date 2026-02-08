
import { api } from './client';

type ApiTask = {
  id: number;
  column_id: number;
  title: string;
  description: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  order: number;
  created_at: string;
  updated_at: string;
};

type ApiTaskListResponse = {
  items: ApiTask[];
  total: number;
  page: number;
  limit: number;
};

type ApiColumn = {
  id: number;
  board_id: number;
  title: string;
  order: number;
  created_at: string;
};

type ApiBoard = {
  id: number;
  name: string;
  owner_id: number;
  created_at: string;
  columns: ApiColumn[];
};

export type Task = {
  id: number;
  columnId: number;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type Column = {
  id: number;
  title: string;
  boardId: number;
  order: number;
};

export type Board = {
  id: number;
  name: string;
  columns: Column[];
};

const normalizeTask = (t: ApiTask): Task => {
  return {
    id: t.id,
    columnId: t.column_id,
    title: t.title,
    description: t.description ?? undefined,
    priority: t.priority,
    order: t.order,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  };
};

const normalizeColumn = (c: ApiColumn): Column => {
  return {
    id: c.id,
    title: c.title,
    boardId: c.board_id,
    order: c.order,
  };
};

const normalizeBoard = (b: ApiBoard): Board => {
  return {
    id: b.id,
    name: b.name,
    columns: Array.isArray(b.columns) ? b.columns.map(normalizeColumn) : [],
  };
};

export const getMyBoard = async () => {
  const res = await api.get<ApiBoard>('/boards/me');
  return normalizeBoard(res.data);
};

export type TaskSort = 'order' | 'createdAt' | 'priority';

export type TaskListResponse = {
  items: Task[];
  total: number;
  page: number;
  limit: number;
};

export const getTasks = async (
  columnId: number,
  params?: { search?: string; page?: number; limit?: number; sort?: TaskSort },
) => {
  const res = await api.get<ApiTaskListResponse>(`/columns/${columnId}/tasks`, {
    params,
  });

  return {
    items: res.data.items.map(normalizeTask),
    total: res.data.total,
    page: res.data.page,
    limit: res.data.limit,
  } satisfies TaskListResponse;
};

export const getTask = async (taskId: number) => {
  const res = await api.get<ApiTask>(`/tasks/${taskId}`);
  return normalizeTask(res.data);
};

export const createTask = async (
  columnId: number,
  data: { title: string; priority?: 'LOW' | 'MEDIUM' | 'HIGH'; description?: string },
) => {
  const res = await api.post<ApiTask>(`/columns/${columnId}/tasks`, data);
  return normalizeTask(res.data);
};

export const updateTask = async (
  taskId: number,
  data: Partial<Pick<Task, 'title' | 'description' | 'priority' | 'order'>> & { columnId?: number },
) => {
  const res = await api.patch<ApiTask>(`/tasks/${taskId}`, data);
  return normalizeTask(res.data);
};

export const deleteTask = async (taskId: number) => {
  await api.delete(`/tasks/${taskId}`);
};