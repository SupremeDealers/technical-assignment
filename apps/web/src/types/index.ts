// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthData {
  user: User;
  token: string;
}

export interface AuthResponse {
  success: boolean;
  data: AuthData;
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

// Board types
export interface Board {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  columns?: Column[];
}

export interface CreateBoardDto {
  name: string;
}

// Column types
export interface Column {
  id: string;
  title: string;
  position?: number;
  order?: number;
  boardId: string;
  taskCount?: number;
  createdAt: string;
  updatedAt?: string;
  tasks?: Task[];
}

export interface CreateColumnDto {
  title: string;
  position?: number;
}

export interface UpdateColumnDto {
  title?: string;
  position?: number;
}

// Task types
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  status?: string;
  columnId: string;
  commentCount?: number;
  order?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  order?: number;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  status?: string;
  columnId?: string;
  order?: number;
}

// Comment types
export interface CommentAuthor {
  id: string;
  email: string;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt?: string;
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

// API Error
export interface ApiErrorDetail {
  path: string;
  issue: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details: ApiErrorDetail[] | null;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
