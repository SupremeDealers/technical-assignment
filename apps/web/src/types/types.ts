export interface Column {
  id: string;
  name: string;
  order: number;
  boardId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  boardId: string;
  columnId: string;
  authorId: string;
  column: Column;
}

export interface Tasks {
  tasks: Task[];
  meta: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}
export interface Profile {
  id: string;
  email: string;
  name: string;
}

export interface Board {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  columns: Column[];
}
