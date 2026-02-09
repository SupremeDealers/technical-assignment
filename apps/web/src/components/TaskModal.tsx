import { useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi, type Task } from "../api/client";

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: () => void;
}

export function TaskModal({ task, onClose, onUpdate }: TaskModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority);
  const [commentText, setCommentText] = useState("");

  const queryClient = useQueryClient();

  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", task.id],
    queryFn: () => tasksApi.getComments(task.id),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      tasksApi.update(task.id, {
        title,
        description: description || undefined,
        priority,
      }),
    onSuccess: () => {
      onUpdate();
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => tasksApi.delete(task.id),
    onSuccess: () => {
      onUpdate();
      onClose();
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => tasksApi.createComment(task.id, { content }),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["comments", task.id] });
    },
  });

  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      updateMutation.mutate();
    }
  };

  const handleAddComment = (e: FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      commentMutation.mutate(commentText.trim());
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "1.5rem",
          maxWidth: "700px",
          width: "90%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          {isEditing ? (
            <form onSubmit={handleUpdate} style={{ flex: 1, marginRight: "1rem" }}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  marginBottom: "0.5rem",
                }}
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Description (optional)"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  fontSize: "1rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontFamily: "inherit",
                  marginBottom: "0.5rem",
                  resize: "vertical",
                }}
              />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
                style={{
                  padding: "0.5rem",
                  fontSize: "1rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  marginBottom: "0.5rem",
                }}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#0066cc",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setTitle(task.title);
                    setDescription(task.description || "");
                    setPriority(task.priority);
                  }}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "transparent",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem" }}>{task.title}</h2>
              {task.description && (
                <p style={{ margin: "0 0 1rem 0", color: "#666", whiteSpace: "pre-wrap" }}>
                  {task.description}
                </p>
              )}
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span
                  style={{
                    fontSize: "0.75rem",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "12px",
                    backgroundColor:
                      task.priority === "high"
                        ? "#f44336"
                        : task.priority === "medium"
                        ? "#ff9800"
                        : "#4caf50",
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  {task.priority}
                </span>
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    padding: "0.25rem 0.75rem",
                    backgroundColor: "transparent",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this task?")) {
                      deleteMutation.mutate();
                    }
                  }}
                  style={{
                    padding: "0.25rem 0.75rem",
                    backgroundColor: "transparent",
                    border: "1px solid #f44336",
                    color: "#f44336",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              backgroundColor: "transparent",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              padding: "0",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #e0e0e0", margin: "1.5rem 0" }} />

        <section>
          <h3 style={{ margin: "0 0 1rem 0", fontSize: "1rem" }}>Comments</h3>

          <form onSubmit={handleAddComment} style={{ marginBottom: "1rem" }}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              style={{
                width: "100%",
                padding: "0.5rem",
                fontSize: "0.875rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontFamily: "inherit",
                marginBottom: "0.5rem",
                resize: "vertical",
              }}
            />
            <button
              type="submit"
              disabled={!commentText.trim() || commentMutation.isPending}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: commentMutation.isPending ? "#999" : "#0066cc",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: commentMutation.isPending ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
              }}
            >
              {commentMutation.isPending ? "Adding..." : "Add Comment"}
            </button>
          </form>

          {commentsLoading ? (
            <p style={{ color: "#666", fontSize: "0.875rem" }}>Loading comments...</p>
          ) : comments.length === 0 ? (
            <p style={{ color: "#999", fontSize: "0.875rem", fontStyle: "italic" }}>
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "6px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                      {comment.user_name}
                    </span>
                    <span style={{ color: "#666", fontSize: "0.75rem" }}>
                      {new Date(comment.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.875rem", whiteSpace: "pre-wrap" }}>
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
