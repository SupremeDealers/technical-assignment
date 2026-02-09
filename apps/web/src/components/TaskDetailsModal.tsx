import { useState, FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../lib/auth-context";
import { api, ApiError } from "../lib/api";

interface Task {
  id: number;
  columnId: number;
  title: string;
  description: string | null;
  priority: string;
  createdBy: { id: number; name: string; email: string };
  assignedTo: { id: number; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
}

export function TaskDetailsModal({ task, onClose }: TaskDetailsModalProps) {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    task.priority as "low" | "medium" | "high"
  );
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", task.id],
    queryFn: () => api.getTaskComments(task.id, token!),
    enabled: !!token,
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data: {
      title?: string;
      description?: string | null;
      priority?: "low" | "medium" | "high";
    }) => api.updateTask(task.id, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["board"] });
      setIsEditing(false);
      setError("");
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to update task");
      }
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: () => api.deleteTask(task.id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["board"] });
      onClose();
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to delete task");
      }
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) =>
      api.createComment(task.id, { content }, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", task.id] });
      setNewComment("");
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to add comment");
      }
    },
  });

  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    updateTaskMutation.mutate({
      title: title.trim(),
      description: description.trim() || null,
      priority,
    });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate();
    }
  };

  const handleAddComment = (e: FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment.trim());
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#dc3545";
      case "medium":
        return "#ffc107";
      case "low":
        return "#28a745";
      default:
        return "#6c757d";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <h2 style={styles.modalTitle}>Task Details</h2>
            <button onClick={onClose} style={styles.closeButton}>
              ×
            </button>
          </div>
          {!isEditing && (
            <div style={styles.actions}>
              <button onClick={() => setIsEditing(true)} style={styles.editButton}>
                Edit
              </button>
              <button
                onClick={handleDelete}
                style={styles.deleteButton}
                disabled={deleteTaskMutation.isPending}
              >
                {deleteTaskMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>

        <div style={styles.content}>
          {error && <div style={styles.error}>{error}</div>}

          {isEditing ? (
            <form onSubmit={handleUpdate} style={styles.form}>
              <div style={styles.field}>
                <label htmlFor="title" style={styles.label}>
                  Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={styles.input}
                  disabled={updateTaskMutation.isPending}
                />
              </div>

              <div style={styles.field}>
                <label htmlFor="description" style={styles.label}>
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  style={styles.textarea}
                  disabled={updateTaskMutation.isPending}
                />
              </div>

              <div style={styles.field}>
                <label htmlFor="priority" style={styles.label}>
                  Priority
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as "low" | "medium" | "high")
                  }
                  style={styles.select}
                  disabled={updateTaskMutation.isPending}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div style={styles.formActions}>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setTitle(task.title);
                    setDescription(task.description || "");
                    setPriority(task.priority as "low" | "medium" | "high");
                    setError("");
                  }}
                  style={styles.cancelButton}
                  disabled={updateTaskMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.saveButton}
                  disabled={updateTaskMutation.isPending}
                >
                  {updateTaskMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div style={styles.details}>
              <div style={styles.detailSection}>
                <h3 style={styles.taskTitle}>{task.title}</h3>
                <div
                  style={{
                    ...styles.priorityBadge,
                    backgroundColor: getPriorityColor(task.priority),
                  }}
                >
                  {task.priority} priority
                </div>
              </div>

              {task.description && (
                <div style={styles.detailSection}>
                  <h4 style={styles.sectionTitle}>Description</h4>
                  <p style={styles.descriptionText}>{task.description}</p>
                </div>
              )}

              <div style={styles.detailSection}>
                <h4 style={styles.sectionTitle}>Details</h4>
                <div style={styles.detailGrid}>
                  <div>
                    <strong>Created by:</strong> {task.createdBy.name}
                  </div>
                  <div>
                    <strong>Assigned to:</strong>{" "}
                    {task.assignedTo ? task.assignedTo.name : "Unassigned"}
                  </div>
                  <div>
                    <strong>Created:</strong> {formatDate(task.createdAt)}
                  </div>
                  <div>
                    <strong>Updated:</strong> {formatDate(task.updatedAt)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={styles.commentsSection}>
            <h4 style={styles.sectionTitle}>
              Comments ({commentsData?.comments.length || 0})
            </h4>

            <form onSubmit={handleAddComment} style={styles.commentForm}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                style={styles.commentInput}
                disabled={addCommentMutation.isPending}
              />
              <button
                type="submit"
                style={styles.commentButton}
                disabled={!newComment.trim() || addCommentMutation.isPending}
              >
                {addCommentMutation.isPending ? "Adding..." : "Add Comment"}
              </button>
            </form>

            <div style={styles.commentList}>
              {commentsLoading && <div style={styles.loading}>Loading comments...</div>}
              {commentsData?.comments.length === 0 && !commentsLoading && (
                <div style={styles.emptyComments}>No comments yet</div>
              )}
              {commentsData?.comments.map((comment) => (
                <div key={comment.id} style={styles.comment}>
                  <div style={styles.commentHeader}>
                    <div style={styles.commentAuthor}>
                      <span style={styles.avatar}>
                        {comment.user.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <div style={styles.authorName}>{comment.user.name}</div>
                        <div style={styles.commentDate}>
                          {formatDate(comment.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={styles.commentContent}>{comment.content}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "8px",
    width: "100%",
    maxWidth: "700px",
    maxHeight: "90vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column" as const,
  },
  header: {
    borderBottom: "1px solid #e0e0e0",
    padding: "20px 24px",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  modalTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "600" as const,
    color: "#333",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "32px",
    cursor: "pointer",
    color: "#999",
    padding: 0,
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    display: "flex",
    gap: "8px",
  },
  editButton: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "500" as const,
    color: "#007bff",
    backgroundColor: "white",
    border: "1px solid #007bff",
    borderRadius: "4px",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "500" as const,
    color: "white",
    backgroundColor: "#dc3545",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  content: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "24px",
  },
  error: {
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#fee",
    color: "#c33",
    borderRadius: "4px",
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
  },
  field: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500" as const,
    color: "#333",
  },
  input: {
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    outline: "none",
  },
  textarea: {
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    outline: "none",
    fontFamily: "inherit",
    resize: "vertical" as const,
  },
  select: {
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    outline: "none",
    backgroundColor: "white",
  },
  formActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
  },
  cancelButton: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "500" as const,
    color: "#666",
    backgroundColor: "white",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
  },
  saveButton: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600" as const,
    color: "white",
    backgroundColor: "#007bff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  details: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "24px",
  },
  detailSection: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  },
  taskTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "600" as const,
    color: "#333",
  },
  priorityBadge: {
    display: "inline-block",
    fontSize: "12px",
    fontWeight: "600" as const,
    color: "white",
    padding: "4px 12px",
    borderRadius: "12px",
    textTransform: "uppercase" as const,
    width: "fit-content",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "600" as const,
    color: "#333",
  },
  descriptionText: {
    margin: 0,
    fontSize: "14px",
    color: "#666",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap" as const,
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    fontSize: "14px",
    color: "#666",
  },
  commentsSection: {
    marginTop: "24px",
    paddingTop: "24px",
    borderTop: "2px solid #e0e0e0",
  },
  commentForm: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
    marginTop: "16px",
    marginBottom: "24px",
  },
  commentInput: {
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    outline: "none",
    fontFamily: "inherit",
    resize: "vertical" as const,
  },
  commentButton: {
    alignSelf: "flex-end",
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600" as const,
    color: "white",
    backgroundColor: "#007bff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  commentList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  },
  loading: {
    textAlign: "center" as const,
    padding: "20px",
    color: "#666",
    fontSize: "14px",
  },
  emptyComments: {
    textAlign: "center" as const,
    padding: "20px",
    color: "#999",
    fontSize: "14px",
  },
  comment: {
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    padding: "16px",
  },
  commentHeader: {
    marginBottom: "12px",
  },
  commentAuthor: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#007bff",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "600" as const,
  },
  authorName: {
    fontSize: "14px",
    fontWeight: "600" as const,
    color: "#333",
  },
  commentDate: {
    fontSize: "12px",
    color: "#999",
    marginTop: "2px",
  },
  commentContent: {
    fontSize: "14px",
    color: "#666",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap" as const,
  },
};
