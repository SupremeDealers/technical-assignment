export interface User {
  user_id: string;
  email: string;
  username: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  user: User;
}

export interface RegisterDto {
  email: string;
  username: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface Board {
  board_id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  columns: Column[];
}

export interface Column {
  column_id: string;
  board_id: string;
  name: string;
  order: number;
  _count: {
    tasks: number;
  };
  tasks: Task[];
}

export enum PRIORITY_ENUM {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export interface Task {
  author_id: string;
  column_id: string;
  created_at: string;
  description: string;
  name: string;
  priority: PRIORITY_ENUM;
  status: string;
  task_id: string;
  updated_at: string;
  comments: Comment[];
}
export interface Comment {
  comment_id: string;
  content: string;
  task_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  author?: User;
}

export interface CreateBoardDto {
  name: string;
  description?: string;
}

export interface UpdateBoardDto {
  name?: string;
  description?: string;
}

export interface CreateTaskDto {
  name: string;
  description?: string;
  priority: PRIORITY_ENUM;
  column_id: string;
}

export interface UpdateTaskDto {
  name?: string;
  description?: string;
  priority?: PRIORITY_ENUM;
  column_id?: string;
  order?: number;
}

export interface CreateCommentDto {
  content: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
