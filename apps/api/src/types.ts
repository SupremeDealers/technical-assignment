export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface UserPublic {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Board {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface BoardWithDetails extends Board {
  owner: UserPublic;
  columns: ColumnWithTaskCount[];
}

export interface Column {
  id: string;
  board_id: string;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface ColumnWithTaskCount extends Column {
  task_count: number;
}

export interface ColumnWithTasks extends Column {
  tasks: Task[];
}

export interface Task {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high";
  position: number;
  assignee_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TaskWithDetails extends Task {
  assignee: UserPublic | null;
  creator: UserPublic;
  comment_count: number;
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CommentWithUser extends Comment {
  user: UserPublic;
}

export interface BoardMember {
  board_id: string;
  user_id: string;
  role: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  user: UserPublic;
  token: string;
}
