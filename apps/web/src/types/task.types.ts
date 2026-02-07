export type Priority = "low" | "medium" | "high";

/**
 * Task from API
 */
export type Task = {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  priority: Priority;
  position: number;
  createdBy: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string

  // UI-only optional fields
  isDragging?: boolean;
  commentsCount?: number;
};

/**
 * Inputs (Forms / Mutations)
 */
export type CreateTaskInput = {
  title: string;
  description?: string;
  priority?: Priority;
  position?: number;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  priority?: Priority;
  columnId?: string;
  position?: number;
};

/**
 * Query Params
 */
export type TasksQuery = {
  search?: string;
  page?: number;
  limit?: number;
  sort?: "createdAt" | "priority";
  order?: "asc" | "desc";
};

/**
 * Paginated API Response
 */
export type PaginatedTasks = {
  data: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
};

/**
 * Comments
 */
export type Comment = {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
};

export type CreateCommentInput = {
  content: string;
};

/**
 * Store / UI State
 */
export type TaskState = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  pagination: PaginatedTasks["pagination"] | null;
};
