export type User = {
  id: string;
  name: string;
  email: string;
};

export type Board = {
  id: string;
  title: string;
};

export type Column = {
  id: string;
  title: string;
  order: number;
  taskCount: number;
};

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  priority: number;
  columnId: string;
  boardId: string;
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  id: string;
  body: string;
  taskId: string;
  authorId: string;
  author?: { id: string; name: string };
  createdAt: string;
};

export type TaskList = {
  items: Task[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
