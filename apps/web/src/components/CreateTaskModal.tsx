import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { columnsApi } from "../api/client";

interface CreateTaskModalProps {
  columnId: number;
  onClose: () => void;
  onCreate: () => void;
}

export function CreateTaskModal({ columnId, onClose, onCreate }: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const createMutation = useMutation({
    mutationFn: () =>
      columnsApi.createTask(columnId, {
        title,
        description: description || undefined,
        priority,
      }),
    onSuccess: () => {
      onCreate();
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      createMutation.mutate();
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
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "2rem",
          maxWidth: "540px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.75rem",
        }}>
          <h2 style={{
            margin: 0,
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#1c1e21",
          }}>
            Create New Task
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              backgroundColor: "#f0f2f5",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              padding: "0",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              color: "#65676b",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e4e6eb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f0f2f5";
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label
              htmlFor="task-title"
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: 600,
                fontSize: "0.875rem",
                color: "#1c1e21",
              }}
            >
              Title *
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              placeholder="Enter task title"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                fontSize: "0.9375rem",
                border: "1px solid #d0d3d9",
                borderRadius: "8px",
                boxSizing: "border-box",
                transition: "all 0.2s ease",
                backgroundColor: "#f8f9fa",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#0084ff";
                e.currentTarget.style.backgroundColor = "white";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#d0d3d9";
                e.currentTarget.style.backgroundColor = "#f8f9fa";
              }}
            />
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label
              htmlFor="task-description"
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: 600,
                fontSize: "0.875rem",
                color: "#1c1e21",
              }}
            >
              Description
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Add task details (optional)"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                fontSize: "0.9375rem",
                border: "1px solid #d0d3d9",
                borderRadius: "8px",
                boxSizing: "border-box",
                fontFamily: "inherit",
                resize: "vertical",
                transition: "all 0.2s ease",
                backgroundColor: "#f8f9fa",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#0084ff";
                e.currentTarget.style.backgroundColor = "white";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#d0d3d9";
                e.currentTarget.style.backgroundColor = "#f8f9fa";
              }}
            />
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label
              htmlFor="task-priority"
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: 600,
                fontSize: "0.875rem",
                color: "#1c1e21",
              }}
            >
              Priority
            </label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                fontSize: "0.9375rem",
                border: "1px solid #d0d3d9",
                borderRadius: "8px",
                boxSizing: "border-box",
                backgroundColor: "#f8f9fa",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#0084ff";
                e.currentTarget.style.backgroundColor = "white";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#d0d3d9";
                e.currentTarget.style.backgroundColor = "#f8f9fa";
              }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "white",
                border: "1px solid #d0d3d9",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.9375rem",
                fontWeight: 500,
                color: "#65676b",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f0f2f5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || createMutation.isPending}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: (!title.trim() || createMutation.isPending) ? "#b0b3b8" : "#0084ff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: (!title.trim() || createMutation.isPending) ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontSize: "0.9375rem",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
              onMouseEnter={(e) => {
                if (title.trim() && !createMutation.isPending) {
                  e.currentTarget.style.backgroundColor = "#0073e6";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (title.trim() && !createMutation.isPending) {
                  e.currentTarget.style.backgroundColor = "#0084ff";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                }
              }}
            >
              {createMutation.isPending ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
