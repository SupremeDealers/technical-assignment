export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPublic {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
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
  max_tasks: number | null;
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
  status: "todo" | "in_progress" | "completed";
  position: number;
  assignee_id: string | null;
  created_by: string;
  due_date: string | null;
  labels: string | null;
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
  role: "owner" | "admin" | "member";
}

export interface BoardMemberWithUser extends BoardMember {
  user: UserPublic;
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

// ============ Activity Log ============
export interface Activity {
  id: string;
  board_id: string;
  task_id: string | null;
  user_id: string;
  action: "created" | "updated" | "deleted" | "moved" | "commented" | "assigned" | "completed" | "archived";
  entity_type: "task" | "column" | "board" | "comment";
  entity_name: string;
  details: string | null;
  metadata: string | null; // JSON string with additional context
  created_at: string;
}

export interface ActivityWithUser extends Activity {
  user: UserPublic;
}

// ============ Task Checklists ============
export interface ChecklistItem {
  id: string;
  task_id: string;
  content: string;
  is_completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

// ============ Task Time Tracking ============
export interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  description: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  created_at: string;
}

export interface TimeEntryWithUser extends TimeEntry {
  user: UserPublic;
}

// ============ Task Attachments ============
export interface Attachment {
  id: string;
  task_id: string;
  user_id: string;
  filename: string;
  url: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
}

export interface AttachmentWithUser extends Attachment {
  user: UserPublic;
}

// ============ Notifications ============
export interface Notification {
  id: string;
  user_id: string;
  type: "task_assigned" | "task_completed" | "comment_added" | "due_date_reminder" | "mentioned";
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

// ============ Board Analytics ============
export interface BoardAnalytics {
  board_id: string;
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  tasks_by_priority: {
    low: number;
    medium: number;
    high: number;
  };
  tasks_by_status: {
    todo: number;
    in_progress: number;
    completed: number;
  };
  tasks_by_column: Array<{
    column_id: string;
    column_name: string;
    task_count: number;
  }>;
  recent_activity_count: number;
  avg_completion_time_days: number | null;
  member_stats: Array<{
    user_id: string;
    user_name: string;
    assigned_tasks: number;
    completed_tasks: number;
  }>;
}

// ============ Task Templates ============
export interface TaskTemplate {
  id: string;
  board_id: string;
  name: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high";
  labels: string | null;
  checklist_items: string | null; // JSON array of checklist items
  estimated_hours: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ============ Extended Task with new features ============
export interface TaskWithAllDetails extends TaskWithDetails {
  checklist_items: ChecklistItem[];
  time_entries: TimeEntryWithUser[];
  attachments: AttachmentWithUser[];
  total_time_minutes: number;
  estimated_hours: number | null;
}
