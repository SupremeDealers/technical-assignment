import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentAPI, taskAPI } from "../api";
import { useAuth } from "../AuthContext";

interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  columnId: string;
}

export function TaskModal({
  task,
  boardId,
  onClose,
}: {
  task: Task;
  boardId: string;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");

  const commentsQuery = useQuery({
    queryKey: ["comments", task.id],
    queryFn: () => commentAPI.list(task.id),
  });

  const createCommentMutation = useMutation({
    mutationFn: (content: string) => commentAPI.create(task.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", task.id] });
      setNewComment("");
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: () => taskAPI.delete(task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      onClose();
    },
  });

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      createCommentMutation.mutate(newComment);
    }
  };

  const comments = commentsQuery.data || [];

  return (
    <>
      {/* Modal backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 999,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          borderRadius: 8,
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
          zIndex: 1000,
          width: "90%",
          maxWidth: 600,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 20,
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h2 style={{ margin: "0 0 8px 0" }}>{task.title}</h2>
            <p style={{ margin: 0, color: "#999", fontSize: 12 }}>
              Created on {new Date(task.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: "#999",
              padding: 0,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 20,
          }}
        >
          {task.description && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ margin: "0 0 8px 0", fontSize: 14, color: "#666" }}>
                Description
              </h3>
              <p style={{ margin: 0, lineHeight: 1.6 }}>{task.description}</p>
            </div>
          )}

          {/* Comments section */}
          <div>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 14, color: "#666" }}>
              Comments
            </h3>

            {commentsQuery.isLoading && (
              <p style={{ color: "#999" }}>Loading comments...</p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {comments.map((comment: any) => (
                <div
                  key={comment.id}
                  style={{
                    padding: 12,
                    backgroundColor: "#f9f9f9",
                    borderRadius: 6,
                    borderLeft: "3px solid #0066cc",
                  }}
                >
                  <p style={{ margin: "0 0 6px 0", fontSize: 12, fontWeight: 600 }}>
                    {comment.author?.email || "Unknown"}
                  </p>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>
                    {comment.content}
                  </p>
                  <p style={{ margin: "6px 0 0 0", fontSize: 11, color: "#999" }}>
                    {new Date(comment.createdAt).toLocaleDateString()}{" "}
                    {new Date(comment.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Add comment form */}
            <form onSubmit={handleAddComment} style={{ marginBottom: 20 }}>
              <textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  marginBottom: 8,
                  fontFamily: "inherit",
                  fontSize: 14,
                  boxSizing: "border-box",
                  minHeight: 80,
                  resize: "vertical",
                }}
              />
              <button
                type="submit"
                disabled={createCommentMutation.isPending || !newComment.trim()}
                style={{
                  padding: "8px 16px",
                  backgroundColor: newComment.trim() ? "#0066cc" : "#ccc",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: newComment.trim() ? "pointer" : "not-allowed",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {createCommentMutation.isPending ? "Posting..." : "Post comment"}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: 20,
            borderTop: "1px solid #eee",
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={() =>
              deleteTaskMutation.mutate()
            }
            disabled={deleteTaskMutation.isPending}
            style={{
              padding: "8px 16px",
              backgroundColor: "#fee",
              color: "#c00",
              border: "1px solid #fcc",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Delete task
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              backgroundColor: "#f0f0f0",
              border: "1px solid #ccc",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
