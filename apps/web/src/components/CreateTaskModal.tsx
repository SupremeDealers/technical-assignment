import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

interface CreateTaskModalProps {
  columnId: number;
  boardId: number;
  onClose: () => void;
}

export function CreateTaskModal({ columnId, boardId, onClose }: CreateTaskModalProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  const createMutation = useMutation({
    mutationFn: () =>
      api.createTask(columnId, {
        title,
        description: description || undefined,
        priority,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", columnId] });
      queryClient.invalidateQueries({ queryKey: ["columns", boardId] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      createMutation.mutate();
    }
  };

  return (
    <div
      className="overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Create new task"
    >
      <div className="modal" style={{ padding: "28px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}>
          <h2 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.25rem",
            margin: 0,
          }}>
            New Task
          </h2>
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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="task-title">Title</label>
            <input
              id="task-title"
              type="text"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              placeholder="Add details, context, or links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ resize: "vertical" }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label htmlFor="task-priority">Priority</label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["low", "medium", "high"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`btn btn-sm ${priority === p ? "btn-primary" : "btn-secondary"}`}
                  style={{
                    flex: 1,
                    textTransform: "capitalize",
                    background: priority === p
                      ? (p === "high" ? "var(--priority-high)"
                        : p === "medium" ? "var(--accent)"
                        : "var(--priority-low)")
                      : undefined,
                    color: priority === p ? "white" : undefined,
                    borderColor: priority === p ? "transparent" : undefined,
                  }}
                >
                  {p === "high" ? "🔴" : p === "medium" ? "🟡" : "🟢"} {p}
                </button>
              ))}
            </div>
          </div>

          {createMutation.isError && (
            <div style={{
              padding: "10px 14px",
              background: "#fdeaea",
              color: "var(--error)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.85rem",
              marginBottom: 16,
            }}>
              Failed to create task. Please try again.
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!title.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
