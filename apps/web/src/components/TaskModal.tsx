import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Task } from "../lib/api";

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onEdit: () => void;
}

export function TaskModal({ task, onClose, onEdit }: TaskModalProps) {
  const [commentContent, setCommentContent] = useState("");
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", task.id],
    queryFn: () => api.getTaskComments(task.id),
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => api.createComment(task.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", task.id] });
      setCommentContent("");
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: () => api.deleteTask(task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["columns"] });
      onClose();
    },
  });

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentContent.trim()) {
      addCommentMutation.mutate(commentContent);
    }
  };

  const priorityColors = {
    low: "#28a745",
    medium: "#ffc107",
    high: "#dc3545",
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "8px",
          padding: "30px",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "80vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "20px" }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: "0 0 10px 0" }}>{task.title}</h2>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span
                style={{
                  background: priorityColors[task.priority],
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  textTransform: "uppercase",
                }}
              >
                {task.priority}
              </span>
              <span style={{ fontSize: "13px", color: "#666" }}>
                Created by {task.createdBy.name}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              padding: "0",
              width: "30px",
              height: "30px",
            }}
          >
            ×
          </button>
        </div>

        {task.description && (
          <div style={{ marginBottom: "30px" }}>
            <h3 style={{ fontSize: "14px", marginBottom: "10px" }}>Description</h3>
            <p style={{ margin: 0, color: "#666", lineHeight: "1.6" }}>{task.description}</p>
          </div>
        )}

        <div style={{ borderTop: "1px solid #ddd", paddingTop: "20px" }}>
          <h3 style={{ fontSize: "16px", marginBottom: "15px" }}>
            Comments ({comments.length})
          </h3>

          <form onSubmit={handleAddComment} style={{ marginBottom: "20px" }}>
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "14px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                resize: "vertical",
              }}
            />
            <button
              type="submit"
              disabled={addCommentMutation.isPending || !commentContent.trim()}
              style={{
                marginTop: "10px",
                padding: "8px 16px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: addCommentMutation.isPending || !commentContent.trim() ? "not-allowed" : "pointer",
              }}
            >
              {addCommentMutation.isPending ? "Adding..." : "Add Comment"}
            </button>
          </form>

          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {comments.length === 0 ? (
              <p style={{ color: "#999", textAlign: "center", padding: "20px" }}>
                No comments yet
              </p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    background: "#f8f9fa",
                    padding: "12px",
                    borderRadius: "6px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <strong style={{ fontSize: "13px" }}>{comment.user.name}</strong>
                    <span style={{ fontSize: "12px", color: "#999" }}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.5" }}>
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #ddd", display: "flex", gap: "12px" }}>
          <button
            onClick={onEdit}
            style={{
              padding: "10px 20px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Edit Task
          </button>
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete this task?")) {
                deleteTaskMutation.mutate();
              }
            }}
            disabled={deleteTaskMutation.isPending}
            style={{
              padding: "10px 20px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: deleteTaskMutation.isPending ? "not-allowed" : "pointer",
              fontWeight: "500",
            }}
          >
            {deleteTaskMutation.isPending ? "Deleting..." : "Delete Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
