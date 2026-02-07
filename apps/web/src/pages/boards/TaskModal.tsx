import { useState, FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import {
  getTask,
  getComments,
  updateTask,
  deleteTask,
  createComment,
  ColumnWithTaskCount,
  Priority,
} from "../../api/client";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import { Input, Textarea, Select } from "../../components/Input";
import { Loading } from "../../components/Loading";
import "./TaskModal.css";

interface TaskModalProps {
  taskId: string;
  boardId: string;
  columns: ColumnWithTaskCount[];
  onClose: () => void;
}

export function TaskModal({ taskId, boardId, columns, onClose }: TaskModalProps) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<Priority>("medium");
  const [editColumnId, setEditColumnId] = useState("");
  const [newComment, setNewComment] = useState("");

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

  const updateTaskMutation = useMutation({
    mutationFn: (data: {
      title?: string;
      description?: string | null;
      priority?: Priority;
      column_id?: string;
    }) => updateTask(token!, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["board-tasks", boardId] });
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      setIsEditing(false);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: () => deleteTask(token!, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-tasks", boardId] });
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      onClose();
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => createComment(token!, taskId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["board-tasks", boardId] });
      setNewComment("");
    },
  });

  const handleStartEdit = () => {
    if (!taskData?.task) return;
    setEditTitle(taskData.task.title);
    setEditDescription(taskData.task.description || "");
    setEditPriority(taskData.task.priority);
    setEditColumnId(taskData.task.column_id);
    setIsEditing(true);
  };

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    updateTaskMutation.mutate({
      title: editTitle,
      description: editDescription || null,
      priority: editPriority,
      column_id: editColumnId !== taskData?.task.column_id ? editColumnId : undefined,
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

  const task = taskData?.task;
  const comments = commentsData?.comments || [];

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

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEditing ? "Edit Task" : task.title}
      footer={
        !isEditing && (
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
              label="Column"
              name="column"
              value={editColumnId}
              onChange={(e) => setEditColumnId(e.target.value)}
              options={columns.map((col) => ({
                value: col.id,
                label: col.name,
              }))}
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
            </div>

            {task.description && (
              <div className="task-description">
                <h4>Description</h4>
                <p>{task.description}</p>
              </div>
            )}

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
