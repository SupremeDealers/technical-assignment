export interface User {
  id: string;
  email: string;
}

export interface Board {
  id: string;
  name: string;
}

export interface Column {
  id: string;
  title: string;
  order: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  columnId: string;
  createdAt: string;
  assignedTo?: {
    id: string;
    email: string;
  };
  userId?: string;
  _count?: {
    comments: number;
  };
}

export interface TasksResponse {
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    email: string;
  };
}
