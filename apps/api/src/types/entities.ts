export type User = {
  id: number;
  email: string;
  name: string;
  passwordHash?: string;
};

export type Board = {
  id: number;
  title: string;
  createdAt: string;
};

export type Column = {
  id: number;
  boardId: number;
  title: string;
  position: number;
  createdAt: string;
  taskCount?: number;
};

export type Task = {
  id: number;
  columnId: number;
  title: string;
  description: string | null;
  priority: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  creatorName: string | null;
};

export type Comment = {
  id: number;
  taskId: number;
  userId: number;
  body: string;
  createdAt: string;
  authorName: string;
  authorEmail: string;
};

export type TaskListResult = {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
