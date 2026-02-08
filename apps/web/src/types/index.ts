export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Board {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  columns?: Column[];
  _count?: {
    columns: number;
  };
}

export interface Column {
  id: string;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  boardId: string;
  tasks?: Task[];
  _count?: {
    tasks: number;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high";
  order: number;
  createdAt: string;
  updatedAt: string;
  columnId: string;
  creatorId: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  column?: {
    id: string;
    name: string;
    boardId: string;
  };
  _count?: {
    comments: number;
  };
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  taskId: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{ path: string; issue: string }>;
  };
}

export interface PaginatedResponse<T> {
  tasks: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
