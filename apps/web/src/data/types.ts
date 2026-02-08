export interface Task {
  author_id: string;
  column_id: string;
  created_at: string;
  description: string;
  name: string;
  priority: string;
  status: string;
  task_id: string;
  updated_at: string;
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
