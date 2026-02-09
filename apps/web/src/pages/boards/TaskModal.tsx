import { useState, FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import {
  getTask,
  getComments,
  updateTask,
  deleteTask,
  createComment,
  getBoardActivities,
  ColumnWithTaskCount,
  Priority,
  Status,
} from "../../api/client";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import { Input, Textarea, Select } from "../../components/Input";
import { Loading } from "../../components/Loading";
import { TaskChecklist } from "./TaskChecklist";
import { TimeTracking } from "./TimeTracking";
import { 
  FiMessageSquare, 
  FiStar, 
  FiUser, 
  FiEye, 
  FiClipboard, 
  FiPlus, 
  FiEdit2, 
  FiArrowRight, 
  FiCheckCircle 
} from "react-icons/fi";
import "./TaskModal.css";
import "./TaskChecklist.css";
import "./TimeTracking.css";

interface TaskModalProps {
  taskId: string;
  boardId: string;
  columns: ColumnWithTaskCount[];
  onClose: () => void;
}

export function TaskModal({ taskId, boardId, columns, onClose }: TaskModalProps) {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<Priority>("medium");
  const [editStatus, setEditStatus] = useState<Status>("todo");
  const [editColumnId, setEditColumnId] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editLabels, setEditLabels] = useState("");
  const [newComment, setNewComment] = useState("");
  const [showTaskActivity, setShowTaskActivity] = useState(false);

  const { data: taskData, isLoading: taskLoading } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTask(token!, taskId),
    enabled: !!token && !!taskId,
  });

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => getComments(token!, taskId),
    enabled: !!token && !!taskId,
  });

  // Task activity timeline
  const { data: activityData } = useQuery({
    queryKey: ["task-activities", boardId, taskId],
    queryFn: () => getBoardActivities(token!, boardId, { task_id: taskId, limit: 10 }),
    enabled: !!token && !!boardId && !!taskId && showTaskActivity,
  });

  // Permission check: can user edit/delete this task?
  const task = taskData?.task;
  const canModify = task && user && (
    task.created_by === user.id || // Creator
    task.assignee_id === user.id    // Assignee
    // Note: Board owner/admin check would require additional API call
  );

  const updateTaskMutation = useMutation({
    mutationFn: (data: {
      title?: string;
      description?: string | null;
      priority?: Priority;
      status?: Status;
      column_id?: string;
      due_date?: string | null;
      labels?: string | null;
    }) => updateTask(token!, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["board-tasks", boardId] });
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      queryClient.invalidateQueries({ queryKey: ["board-activities", boardId] });
      setIsEditing(false);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: () => deleteTask(token!, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-tasks", boardId] });
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      queryClient.invalidateQueries({ queryKey: ["board-activities", boardId] });
      onClose();
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => createComment(token!, taskId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["board-tasks", boardId] });
      queryClient.invalidateQueries({ queryKey: ["board-activities", boardId] });
      setNewComment("");
    },
  });

  const handleStartEdit = () => {
    if (!taskData?.task) return;
    setEditTitle(taskData.task.title);
    setEditDescription(taskData.task.description || "");
    setEditPriority(taskData.task.priority);
    setEditStatus(taskData.task.status);
    setEditColumnId(taskData.task.column_id);
    setEditDueDate(taskData.task.due_date ? taskData.task.due_date.slice(0, 16) : "");
    setEditLabels(taskData.task.labels || "");
    setIsEditing(true);
  };

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    updateTaskMutation.mutate({
      title: editTitle,
      description: editDescription || null,
      priority: editPriority,
      status: editStatus,
      column_id: editColumnId !== taskData?.task.column_id ? editColumnId : undefined,
      due_date: editDueDate ? new Date(editDueDate).toISOString() : null,
      labels: editLabels || null,
    });
  };

  const handleAddComment = (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addCommentMutation.mutate(newComment);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const comments = commentsData?.comments || [];
  const activities = activityData?.data || [];

  if (taskLoading) {
    return (
      <Modal isOpen onClose={onClose} title="Loading...">
        <Loading text="Loading task..." />
      </Modal>
    );
  }

  if (!task) {
    return (
      <Modal isOpen onClose={onClose} title="Task not found">
        <p>The task could not be found.</p>
      </Modal>
    );
  }

  const priorityLabel = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  const statusLabel = {
    todo: "To Do",
    in_progress: "In Progress",
    completed: "Completed",
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";
  const isOwner = task.created_by === user?.id;
  const isAssignee = task.assignee_id === user?.id;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEditing ? "Edit Task" : task.title}
      footer={
        !isEditing && (
          <>
            {canModify ? (
              <>
                <Button variant="ghost" onClick={handleStartEdit}>
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  loading={deleteTaskMutation.isPending}
                >
                  Delete
                </Button>
              </>
            ) : (
              <span className="permission-notice">
                <FiMessageSquare /> You can add comments but not edit this task
              </span>
            )}
          </>
        )
      }
    >
      <div className="task-modal-content">
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="task-edit-form">
            <Input
              label="Title"
              name="title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
            />
            <Textarea
              label="Description"
              name="description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={4}
            />
            <Select
              label="Priority"
              name="priority"
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as Priority)}
              options={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
              ]}
            />
            <Select
              label="Status"
              name="status"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as Status)}
              options={[
                { value: "todo", label: "To Do" },
                { value: "in_progress", label: "In Progress" },
                { value: "completed", label: "Completed" },
              ]}
            />
            <Select
              label="Column"
              name="column"
              value={editColumnId}
              onChange={(e) => setEditColumnId(e.target.value)}
              options={columns.map((col) => ({
                value: col.id,
                label: col.name,
              }))}
            />
            <Input
              label="Due Date"
              name="due_date"
              type="datetime-local"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
            />
            <Input
              label="Labels (comma-separated)"
              name="labels"
              value={editLabels}
              onChange={(e) => setEditLabels(e.target.value)}
              placeholder="e.g., bug, feature, urgent"
            />
            <div className="task-edit-actions">
              <Button
                type="submit"
                variant="primary"
                loading={updateTaskMutation.isPending}
              >
                Save Changes
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditing(false)}
                disabled={updateTaskMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="task-details">
              <div className="task-detail-row">
                <span className="task-detail-label">Status</span>
                <span className={`badge badge-status-${task.status}`}>
                  {statusLabel[task.status]}
                </span>
              </div>
              <div className="task-detail-row">
                <span className="task-detail-label">Priority</span>
                <span className={`badge badge-priority-${task.priority}`}>
                  {priorityLabel[task.priority]}
                </span>
              </div>
              <div className="task-detail-row">
                <span className="task-detail-label">Column</span>
                <span>
                  {columns.find((c) => c.id === task.column_id)?.name || "Unknown"}
                </span>
              </div>
              {task.due_date && (
                <div className="task-detail-row">
                  <span className="task-detail-label">Due Date</span>
                  <span className={isOverdue ? "text-danger" : ""}>
                    {formatDate(task.due_date)}
                    {isOverdue && " (Overdue)"}
                  </span>
                </div>
              )}
              {task.labels && (
                <div className="task-detail-row">
                  <span className="task-detail-label">Labels</span>
                  <div className="task-labels">
                    {task.labels.split(",").map((label, idx) => (
                      <span key={idx} className="badge badge-label">
                        {label.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="task-detail-row">
                <span className="task-detail-label">Created by</span>
                <div className="task-user">
                  <span className="avatar avatar-sm">{getInitials(task.creator.name)}</span>
                  <span>{task.creator.name}</span>
                </div>
              </div>
              {task.assignee && (
                <div className="task-detail-row">
                  <span className="task-detail-label">Assignee</span>
                  <div className="task-user">
                    <span className="avatar avatar-sm">{getInitials(task.assignee.name)}</span>
                    <span>{task.assignee.name}</span>
                  </div>
                </div>
              )}
              <div className="task-detail-row">
                <span className="task-detail-label">Created</span>
                <span>{formatDate(task.created_at)}</span>
              </div>
              {/* Permission indicator */}
              <div className="task-detail-row">
                <span className="task-detail-label">Your Role</span>
                <span className={`badge badge-role ${isOwner ? 'badge-owner' : isAssignee ? 'badge-assignee' : 'badge-viewer'}`}>
                  {isOwner ? <><FiStar /> Owner</> : isAssignee ? <><FiUser /> Assignee</> : <><FiEye /> Viewer</>}
                </span>
              </div>
            </div>

            {task.description && (
              <div className="task-description">
                <h4>Description</h4>
                <p>{task.description}</p>
              </div>
            )}

            {/* Checklist Section */}
            <TaskChecklist taskId={taskId} />

            {/* Time Tracking Section */}
            <TimeTracking taskId={taskId} />

            {/* Task Activity Timeline */}
            <div className="task-activity-section">
              <button 
                className="task-activity-toggle"
                onClick={() => setShowTaskActivity(!showTaskActivity)}
              >
                <h4><FiClipboard /> Activity Timeline</h4>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  style={{ transform: showTaskActivity ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              
              {showTaskActivity && (
                <div className="task-activity-timeline">
                  {activities.length === 0 ? (
                    <p className="no-activity">No activity recorded yet</p>
                  ) : (
                    <div className="activity-items">
                      {activities.map((activity) => (
                        <div key={activity.id} className="task-activity-item">
                          <span className="task-activity-icon">
                            {activity.action === 'created' && <FiPlus />}
                            {activity.action === 'updated' && <FiEdit2 />}
                            {activity.action === 'moved' && <FiArrowRight />}
                            {activity.action === 'completed' && <FiCheckCircle />}
                            {activity.action === 'assigned' && <FiUser />}
                            {activity.action === 'commented' && <FiMessageSquare />}
                          </span>
                          <div className="task-activity-content">
                            <span className="task-activity-user">{activity.user.name}</span>
                            <span className="task-activity-action">{activity.action}</span>
                            {activity.details && (
                              <span className="task-activity-details">{activity.details}</span>
                            )}
                          </div>
                          <span className="task-activity-time">{formatRelativeTime(activity.created_at)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="task-comments">
              <h4>Comments ({comments.length})</h4>

              {commentsLoading ? (
                <Loading size="sm" text="Loading comments..." />
              ) : comments.length === 0 ? (
                <p className="no-comments">No comments yet</p>
              ) : (
                <div className="comments-list">
                  {comments.map((comment) => (
                    <div key={comment.id} className="comment">
                      <div className="comment-header">
                        <div className="comment-user">
                          <span className="avatar avatar-sm">
                            {getInitials(comment.user.name)}
                          </span>
                          <span className="comment-author">{comment.user.name}</span>
                        </div>
                        <span className="comment-date">{formatDate(comment.created_at)}</span>
                      </div>
                      <p className="comment-content">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleAddComment} className="add-comment-form">
                <Textarea
                  name="comment"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={addCommentMutation.isPending}
                  disabled={!newComment.trim()}
                >
                  Add Comment
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
