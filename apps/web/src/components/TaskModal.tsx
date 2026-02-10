import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

interface TaskModalProps {
  taskId: number;
  boardId: number;
  onClose: () => void;
}

export function TaskModal({ taskId, boardId, onClose }: TaskModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [newComment, setNewComment] = useState("");
  const [moveColumnId, setMoveColumnId] = useState<number | null>(null);

  const { data: taskData, isLoading: taskLoading } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => api.getTask(taskId),
  });

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => api.getComments(taskId),
  });

  const { data: columnsData } = useQuery({
    queryKey: ["columns", boardId],
    queryFn: () => api.getColumns(boardId),
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data: any) => api.updateTask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["columns", boardId] });
      setEditing(false);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: () => api.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["columns", boardId] });
      onClose();
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (body: string) => api.createComment(taskId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
      setNewComment("");
    },
  });

  const handleStartEdit = () => {
    if (taskData?.task) {
      setEditTitle(taskData.task.title);
      setEditDescription(taskData.task.description || "");
      setEditPriority(taskData.task.priority);
      setEditing(true);
    }
  };

  const handleSaveEdit = () => {
    updateTaskMutation.mutate({
      title: editTitle,
      description: editDescription,
      priority: editPriority,
    });
  };

  const handleMoveTask = (columnId: number) => {
    updateTaskMutation.mutate({ column_id: columnId });
    setMoveColumnId(null);
  };

  const task = taskData?.task;
  const comments = commentsData?.comments ?? [];
  const columns = columnsData?.columns ?? [];

  return (
    <div
      className="overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Task details"
    >
      <div className="modal" style={{ maxWidth: 600, padding: 0 }}>
        {taskLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <div className="spinner spinner-lg" />
          </div>
        ) : task ? (
          <>
            {/* Header */}
            <div style={{
              padding: "24px 28px 16px",
              borderBottom: "1px solid var(--border-light)",
            }}>
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
              }}>
                <div style={{ flex: 1 }}>
                  {editing ? (
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "1.3rem",
                        fontWeight: 600,
                        border: "none",
                        borderBottom: "2px solid var(--accent)",
                        background: "transparent",
                        padding: "4px 0",
                        width: "100%",
                        borderRadius: 0,
                      }}
                      autoFocus
                    />
                  ) : (
                    <h2 style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "1.3rem",
                      margin: 0,
                      lineHeight: 1.3,
                    }}>
                      {task.title}
                    </h2>
                  )}
                  <p style={{
                    fontSize: "0.78rem",
                    color: "var(--text-muted)",
                    marginTop: 4,
                    fontStyle: "italic",
                  }}>
                    #{task.id} · Created {new Date(task.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="btn-icon"
                  style={{
                    fontSize: "1.2rem",
                    color: "var(--text-muted)",
                    background: "var(--bg-secondary)",
                    borderRadius: "var(--radius-sm)",
                    width: 32,
                    height: 32,
                  }}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {/* Meta row: priority, assignee, column */}
              <div style={{
                display: "flex",
                gap: 12,
                marginTop: 14,
                flexWrap: "wrap",
              }}>
                {/* Priority selector */}
                {editing ? (
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    style={{
                      width: "auto",
                      padding: "4px 10px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                ) : (
                  <span className={`badge badge-${task.priority}`}>
                    {task.priority === "high" ? "🔴" : task.priority === "low" ? "🟢" : "🟡"}{" "}
                    {task.priority}
                  </span>
                )}

                {/* Assignee */}
                {task.assignee_username && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                  }}>
                    <div style={{
                      width: 22,
                      height: 22,
                      background: "var(--accent-light)",
                      color: "var(--accent-hover)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                    }}>
                      {task.assignee_username.charAt(0).toUpperCase()}
                    </div>
                    {task.assignee_username}
                  </div>
                )}

                {/* Move to column dropdown */}
                <div style={{ position: "relative", marginLeft: "auto" }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setMoveColumnId(moveColumnId !== null ? null : 1)}
                    style={{ fontSize: "0.8rem" }}
                  >
                    ↔ Move
                  </button>
                  {moveColumnId !== null && (
                    <div style={{
                      position: "absolute",
                      right: 0,
                      top: "100%",
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      boxShadow: "var(--shadow-lg)",
                      padding: "6px",
                      zIndex: 10,
                      minWidth: 160,
                    }}>
                      {columns.map((col: any) => (
                        <button
                          key={col.id}
                          onClick={() => handleMoveTask(col.id)}
                          style={{
                            display: "block",
                            width: "100%",
                            textAlign: "left",
                            padding: "8px 12px",
                            background: col.id === task.column_id ? "var(--accent-subtle)" : "transparent",
                            border: "none",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "0.85rem",
                            color: "var(--text-primary)",
                            fontWeight: col.id === task.column_id ? 600 : 400,
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            if (col.id !== task.column_id) e.currentTarget.style.background = "var(--bg-hover)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = col.id === task.column_id ? "var(--accent-subtle)" : "transparent";
                          }}
                        >
                          {col.id === task.column_id && "✓ "}{col.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ padding: "20px 28px" }}>
              <h3 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
                marginBottom: 10,
                fontStyle: "italic",
              }}>
                Description
              </h3>
              {editing ? (
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  placeholder="Add a description..."
                  style={{ resize: "vertical" }}
                />
              ) : (
                <p style={{
                  fontSize: "0.9rem",
                  lineHeight: 1.7,
                  color: task.description ? "var(--text-primary)" : "var(--text-muted)",
                  fontStyle: task.description ? "normal" : "italic",
                  minHeight: 40,
                }}>
                  {task.description || "No description provided"}
                </p>
              )}

              {/* Edit/Save/Delete buttons */}
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                {editing ? (
                  <>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleSaveEdit}
                      disabled={updateTaskMutation.isPending}
                    >
                      {updateTaskMutation.isPending ? "Saving..." : "Save Changes"}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-secondary btn-sm" onClick={handleStartEdit}>
                      ✎ Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        if (confirm("Delete this task?")) deleteTaskMutation.mutate();
                      }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Comments section */}
            <div style={{
              borderTop: "1px solid var(--border-light)",
              padding: "20px 28px 24px",
            }}>
              <h3 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
                marginBottom: 16,
                fontStyle: "italic",
              }}>
                Comments ({comments.length})
              </h3>

              {/* Comment list */}
              {commentsLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 16 }}>
                  <div className="spinner" />
                </div>
              ) : comments.length === 0 ? (
                <p style={{
                  fontStyle: "italic",
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                  textAlign: "center",
                  padding: "16px 0",
                }}>
                  No comments yet. Be the first to share your thoughts.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {comments.map((comment: any) => (
                    <div
                      key={comment.id}
                      style={{
                        padding: "12px 14px",
                        background: "var(--bg-secondary)",
                        borderRadius: "var(--radius-md)",
                        borderLeft: comment.user_id === user?.id
                          ? "3px solid var(--accent)"
                          : "3px solid var(--border)",
                      }}
                    >
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                      }}>
                        <div style={{
                          width: 24,
                          height: 24,
                          background: "var(--accent-light)",
                          color: "var(--accent-hover)",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                        }}>
                          {comment.username?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}>
                          {comment.username}
                        </span>
                        <span style={{
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                          marginLeft: "auto",
                          fontStyle: "italic",
                        }}>
                          {new Date(comment.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p style={{
                        fontSize: "0.88rem",
                        lineHeight: 1.6,
                        color: "var(--text-primary)",
                        margin: 0,
                      }}>
                        {comment.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add comment */}
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    background: "var(--accent)",
                    color: "white",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: 2,
                  }}>
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      rows={2}
                      style={{ resize: "vertical" }}
                      aria-label="Write a comment"
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        if (newComment.trim()) addCommentMutation.mutate(newComment.trim());
                      }}
                      disabled={!newComment.trim() || addCommentMutation.isPending}
                      style={{ marginTop: 8 }}
                    >
                      {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: 48, textAlign: "center" }}>
            <p style={{ color: "var(--error)" }}>Task not found</p>
          </div>
        )}
      </div>
    </div>
  );
}
