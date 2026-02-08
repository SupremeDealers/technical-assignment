export type Board = {
  id: string;
  name: string;
}

export type Column = {
  id: string;
  title: string;
  order: number;
}

export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    email: string;
  };
}

export type Task = {
  id: string;
  title: string;
  columnId: string;
  _count?: {
    comments: number;
  };
}

export type TasksResponse = {
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

