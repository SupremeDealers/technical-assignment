const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export class ApiError extends Error {
  code: string;
  details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = (await response.json()) as ApiErrorResponse;
    throw new ApiError(data.error.code, data.error.message, data.error.details);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

function getHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export interface UserPublic {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  created_at: string;
}

export interface AuthResponse {
  user: UserPublic;
  token: string;
}

export async function register(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email, password, name }),
  });
  return handleResponse<AuthResponse>(response);
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<AuthResponse>(response);
}

export async function getMe(token: string): Promise<{ user: UserPublic }> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getHeaders(token),
  });
  return handleResponse<{ user: UserPublic }>(response);
}

export interface Board {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface ColumnWithTaskCount {
  id: string;
  board_id: string;
  name: string;
  position: number;
  max_tasks: number | null;
  created_at: string;
  updated_at: string;
  task_count: number;
}

export interface BoardWithDetails extends Board {
  owner: UserPublic;
  columns: ColumnWithTaskCount[];
}

export async function getBoards(token: string): Promise<{ boards: Board[] }> {
  const response = await fetch(`${API_BASE_URL}/boards`, {
    headers: getHeaders(token),
  });
  return handleResponse<{ boards: Board[] }>(response);
}

export async function getBoard(token: string, boardId: string): Promise<{ board: BoardWithDetails }> {
  const response = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
    headers: getHeaders(token),
  });
  return handleResponse<{ board: BoardWithDetails }>(response);
}

export async function createBoard(
  token: string,
  data: { name: string; description?: string }
): Promise<{ board: Board }> {
  const response = await fetch(`${API_BASE_URL}/boards`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse<{ board: Board }>(response);
}

export async function updateBoard(
  token: string,
  boardId: string,
  data: { name?: string; description?: string }
): Promise<{ board: Board }> {
  const response = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse<{ board: Board }>(response);
}

export async function deleteBoard(token: string, boardId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  return handleResponse<void>(response);
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

export async function getColumns(
  token: string,
  boardId: string
): Promise<{ columns: ColumnWithTaskCount[] }> {
  const response = await fetch(`${API_BASE_URL}/boards/${boardId}/columns`, {
    headers: getHeaders(token),
  });
  return handleResponse<{ columns: ColumnWithTaskCount[] }>(response);
}

export async function createColumn(
  token: string,
  boardId: string,
  data: { name: string; position?: number }
): Promise<{ column: Column }> {
  const response = await fetch(`${API_BASE_URL}/boards/${boardId}/columns`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse<{ column: Column }>(response);
}

export async function updateColumn(
  token: string,
  columnId: string,
  data: { name?: string; position?: number; max_tasks?: number | null }
): Promise<{ column: Column }> {
  const response = await fetch(`${API_BASE_URL}/columns/${columnId}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse<{ column: Column }>(response);
}

export async function deleteColumn(token: string, columnId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/columns/${columnId}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  return handleResponse<void>(response);
}

export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "in_progress" | "completed";
export type Role = "owner" | "admin" | "member";

export interface Task {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: Status;
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

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TaskQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  sort?: "createdAt" | "priority" | "position" | "dueDate" | "status";
  order?: "asc" | "desc";
  status?: Status;
  priority?: Priority;
  assignee_id?: string;
  overdue?: boolean;
}

export async function getTasks(
  token: string,
  columnId: string,
  params?: TaskQueryParams
): Promise<PaginatedResponse<TaskWithDetails>> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.sort) searchParams.set("sort", params.sort);
  if (params?.order) searchParams.set("order", params.order);

  const queryString = searchParams.toString();
  const url = `${API_BASE_URL}/columns/${columnId}/tasks${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    headers: getHeaders(token),
  });
  return handleResponse<PaginatedResponse<TaskWithDetails>>(response);
}

export async function getTask(token: string, taskId: string): Promise<{ task: TaskWithDetails }> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    headers: getHeaders(token),
  });
  return handleResponse<{ task: TaskWithDetails }>(response);
}

export async function createTask(
  token: string,
  columnId: string,
  data: {
    title: string;
    description?: string;
    priority?: Priority;
    status?: Status;
    assignee_id?: string | null;
    position?: number;
    due_date?: string | null;
    labels?: string | null;
  }
): Promise<{ task: TaskWithDetails }> {
  const response = await fetch(`${API_BASE_URL}/columns/${columnId}/tasks`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse<{ task: TaskWithDetails }>(response);
}

export async function updateTask(
  token: string,
  taskId: string,
  data: {
    title?: string;
    description?: string | null;
    priority?: Priority;
    status?: Status;
    assignee_id?: string | null;
    column_id?: string;
    position?: number;
    due_date?: string | null;
    labels?: string | null;
  }
): Promise<{ task: TaskWithDetails }> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse<{ task: TaskWithDetails }>(response);
}

export async function deleteTask(token: string, taskId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  return handleResponse<void>(response);
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

export async function getComments(
  token: string,
  taskId: string
): Promise<{ comments: CommentWithUser[] }> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/comments`, {
    headers: getHeaders(token),
  });
  return handleResponse<{ comments: CommentWithUser[] }>(response);
}

export async function createComment(
  token: string,
  taskId: string,
  content: string
): Promise<{ comment: CommentWithUser }> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/comments`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ content }),
  });
  return handleResponse<{ comment: CommentWithUser }>(response);
}

export async function updateComment(
  token: string,
  commentId: string,
  content: string
): Promise<{ comment: CommentWithUser }> {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify({ content }),
  });
  return handleResponse<{ comment: CommentWithUser }>(response);
}

export async function deleteComment(token: string, commentId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  return handleResponse<void>(response);
}

// ============ Board Member Management ============

export interface BoardMember {
  board_id: string;
  user_id: string;
  role: Role;
  user: UserPublic;
}

export async function getBoardMembers(
  token: string,
  boardId: string
): Promise<{ members: BoardMember[] }> {
  const response = await fetch(`${API_BASE_URL}/boards/${boardId}/members`, {
    headers: getHeaders(token),
  });
  return handleResponse<{ members: BoardMember[] }>(response);
}

export async function addBoardMember(
  token: string,
  boardId: string,
  data: { email: string; role?: Role }
): Promise<{ member: BoardMember }> {
  const response = await fetch(`${API_BASE_URL}/boards/${boardId}/members`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse<{ member: BoardMember }>(response);
}

export async function updateBoardMember(
  token: string,
  boardId: string,
  memberId: string,
  role: Role
): Promise<{ member: BoardMember }> {
  const response = await fetch(`${API_BASE_URL}/boards/${boardId}/members/${memberId}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify({ role }),
  });
  return handleResponse<{ member: BoardMember }>(response);
}

export async function removeBoardMember(
  token: string,
  boardId: string,
  memberId: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/boards/${boardId}/members/${memberId}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  return handleResponse<void>(response);
}

export async function getBoardRole(
  token: string,
  boardId: string
): Promise<{ role: Role }> {
  const response = await fetch(`${API_BASE_URL}/boards/${boardId}/role`, {
    headers: getHeaders(token),
  });
  return handleResponse<{ role: Role }>(response);
}

// ============ Checklist Items ============

export interface ChecklistItem {
  id: string;
  task_id: string;
  content: string;
  is_completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export async function getChecklistItems(
  token: string,
  taskId: string
): Promise<{ items: ChecklistItem[] }> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/checklist`, {
    headers: getHeaders(token),
  });
  return handleResponse<{ items: ChecklistItem[] }>(response);
}

export async function createChecklistItem(
  token: string,
  taskId: string,
  content: string,
  position?: number
): Promise<{ item: ChecklistItem }> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/checklist`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ content, position }),
  });
  return handleResponse<{ item: ChecklistItem }>(response);
}

export async function updateChecklistItem(
  token: string,
  itemId: string,
  data: { content?: string; is_completed?: boolean; position?: number }
): Promise<{ item: ChecklistItem }> {
  const response = await fetch(`${API_BASE_URL}/checklist/${itemId}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse<{ item: ChecklistItem }>(response);
}

export async function deleteChecklistItem(token: string, itemId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/checklist/${itemId}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  return handleResponse<void>(response);
}

// ============ Time Tracking ============

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

export async function getTimeEntries(
  token: string,
  taskId: string
): Promise<{ entries: TimeEntryWithUser[]; total_minutes: number }> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/time-entries`, {
    headers: getHeaders(token),
  });
  return handleResponse<{ entries: TimeEntryWithUser[]; total_minutes: number }>(response);
}

export async function createTimeEntry(
  token: string,
  taskId: string,
  data: {
    description?: string;
    started_at: string;
    ended_at?: string | null;
    duration_minutes?: number;
  }
): Promise<{ entry: TimeEntryWithUser }> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/time-entries`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse<{ entry: TimeEntryWithUser }>(response);
}

export async function updateTimeEntry(
  token: string,
  entryId: string,
  data: {
    description?: string | null;
    ended_at?: string | null;
    duration_minutes?: number;
  }
): Promise<{ entry: TimeEntry }> {
  const response = await fetch(`${API_BASE_URL}/time-entries/${entryId}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse<{ entry: TimeEntry }>(response);
}

export async function deleteTimeEntry(token: string, entryId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/time-entries/${entryId}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  return handleResponse<void>(response);
}

// ============ Attachments ============

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

export async function getAttachments(
  token: string,
  taskId: string
): Promise<{ attachments: AttachmentWithUser[] }> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/attachments`, {
    headers: getHeaders(token),
  });
  return handleResponse<{ attachments: AttachmentWithUser[] }>(response);
}

export async function createAttachment(
  token: string,
  taskId: string,
  data: {
    filename: string;
    url: string;
    file_type?: string;
    file_size?: number;
  }
): Promise<{ attachment: AttachmentWithUser }> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/attachments`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse<{ attachment: AttachmentWithUser }>(response);
}

export async function deleteAttachment(token: string, attachmentId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/attachments/${attachmentId}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  return handleResponse<void>(response);
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
  metadata: string | null; // JSON string with additional context (e.g., from/to columns for moves)
  created_at: string;
}

export interface ActivityWithUser extends Activity {
  user: UserPublic;
}

export interface ActivityQueryParams {
  page?: number;
  limit?: number;
  task_id?: string;
  action?: Activity["action"];
}

export async function getBoardActivities(
  token: string,
  boardId: string,
  params?: ActivityQueryParams
): Promise<PaginatedResponse<ActivityWithUser>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.task_id) searchParams.set("task_id", params.task_id);
  if (params?.action) searchParams.set("action", params.action);

  const queryString = searchParams.toString();
  const url = `${API_BASE_URL}/boards/${boardId}/activities${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    headers: getHeaders(token),
  });
  return handleResponse<PaginatedResponse<ActivityWithUser>>(response);
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

export async function getNotifications(
  token: string,
  unreadOnly?: boolean
): Promise<{ notifications: Notification[]; unread_count: number }> {
  const url = `${API_BASE_URL}/notifications${unreadOnly ? "?unread=true" : ""}`;
  const response = await fetch(url, {
    headers: getHeaders(token),
  });
  return handleResponse<{ notifications: Notification[]; unread_count: number }>(response);
}

export async function markNotificationRead(
  token: string,
  notificationId: string,
  isRead: boolean
): Promise<{ notification: Notification }> {
  const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify({ is_read: isRead }),
  });
  return handleResponse<{ notification: Notification }>(response);
}

export async function markAllNotificationsRead(token: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
    method: "POST",
    headers: getHeaders(token),
  });
  return handleResponse<{ success: boolean }>(response);
}

// ============ Task Templates ============

export interface TaskTemplate {
  id: string;
  board_id: string;
  name: string;
  title: string;
  description: string | null;
  priority: Priority;
  labels: string | null;
  checklist_items: string | null;
  estimated_hours: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export async function getTaskTemplates(
  token: string,
  boardId: string
): Promise<{ templates: TaskTemplate[] }> {
  const response = await fetch(`${API_BASE_URL}/boards/${boardId}/templates`, {
    headers: getHeaders(token),
  });
  return handleResponse<{ templates: TaskTemplate[] }>(response);
}

export async function createTaskTemplate(
  token: string,
  boardId: string,
  data: {
    name: string;
    title: string;
    description?: string;
    priority?: Priority;
    labels?: string | null;
    checklist_items?: string[];
    estimated_hours?: number;
  }
): Promise<{ template: TaskTemplate }> {
  const response = await fetch(`${API_BASE_URL}/boards/${boardId}/templates`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse<{ template: TaskTemplate }>(response);
}

export async function updateTaskTemplate(
  token: string,
  templateId: string,
  data: {
    name?: string;
    title?: string;
    description?: string | null;
    priority?: Priority;
    labels?: string | null;
    checklist_items?: string[];
    estimated_hours?: number | null;
  }
): Promise<{ template: TaskTemplate }> {
  const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse<{ template: TaskTemplate }>(response);
}

export async function deleteTaskTemplate(token: string, templateId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  return handleResponse<void>(response);
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

export async function getBoardAnalytics(
  token: string,
  boardId: string
): Promise<{ analytics: BoardAnalytics }> {
  const response = await fetch(`${API_BASE_URL}/boards/${boardId}/analytics`, {
    headers: getHeaders(token),
  });
  return handleResponse<{ analytics: BoardAnalytics }>(response);
}

// ============ Smart Search ============

export interface SearchTaskResult {
  id: string;
  title: string;
  description: string | null;
  board_id: string;
  board_name: string;
  column_id: string;
  column_name: string;
  priority: string;
  status: string;
  match_type: "title" | "description" | "labels";
  match_context: string;
}

export interface SearchCommentResult {
  id: string;
  content: string;
  task_id: string;
  task_title: string;
  board_id: string;
  board_name: string;
  author_name: string;
  created_at: string;
  match_context: string;
}

export interface SearchResults {
  query: string;
  results: {
    tasks: SearchTaskResult[];
    comments: SearchCommentResult[];
  };
  total: number;
}

export async function search(
  token: string,
  params: {
    q: string;
    boardId?: string;
    type?: "all" | "tasks" | "comments";
    limit?: number;
  }
): Promise<SearchResults> {
  const searchParams = new URLSearchParams();
  searchParams.set("q", params.q);
  if (params.boardId) searchParams.set("boardId", params.boardId);
  if (params.type) searchParams.set("type", params.type);
  if (params.limit) searchParams.set("limit", params.limit.toString());

  const response = await fetch(`${API_BASE_URL}/boards/search?${searchParams.toString()}`, {
    headers: getHeaders(token),
  });
  return handleResponse<SearchResults>(response);
}

// ============ Board Heatmap (Friction Detector) ============

export interface ColumnHeatmapData {
  column_id: string;
  avg_time_in_column_hours: number;
  avg_comments_per_task: number;
  task_count: number;
  heat_score: number; // 0-100, higher = more friction
  heat_level: "cool" | "warm" | "hot";
  friction_reasons: string[];
}

export async function getBoardHeatmap(
  token: string,
  boardId: string
): Promise<{ heatmap: ColumnHeatmapData[] }> {
  const response = await fetch(`${API_BASE_URL}/boards/${boardId}/heatmap`, {
    headers: getHeaders(token),
  });
  return handleResponse<{ heatmap: ColumnHeatmapData[] }>(response);
}
