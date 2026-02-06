
export interface User {
  id: number;
  email: string;
  password?: string;
  createdAt: string;
}

export interface Board {
  id: number;
  name: string;
  ownerId: number;
  createdAt: string;
}

export interface Column {
  id: number;
  boardId: number;
  title: string;
  order: number;
  createdAt: string;
}

export interface Task {
  id: number;
  columnId: number;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  taskId: number;
  userId: number;
  content: string;
  createdAt: string;
  user?: {
    email: string;
  };
}

export interface JwtPayload {
  userId: number;
  email: string;
}