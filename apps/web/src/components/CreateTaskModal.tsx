import { useState, FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../lib/auth-context";
import { api, ApiError } from "../lib/api";

interface CreateTaskModalProps {
  columnId: number;
  onClose: () => void;
}

export function CreateTaskModal({ columnId, onClose }: CreateTaskModalProps) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [error, setError] = useState("");

  const createTaskMutation = useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      priority: "low" | "medium" | "high";
    }) => api.createTask(columnId, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", columnId] });
      queryClient.invalidateQueries({ queryKey: ["board"] });
      onClose();
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to create task");
      }
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    createTaskMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
    });
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Create New Task</h2>
          <button onClick={onClose} style={styles.closeButton}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

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
              disabled={createTaskMutation.isPending}
              autoFocus
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
              disabled={createTaskMutation.isPending}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="priority" style={styles.label}>
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
              style={styles.select}
              disabled={createTaskMutation.isPending}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelButton}
              disabled={createTaskMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={createTaskMutation.isPending}
            >
              {createTaskMutation.isPending ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
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
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "8px",
    width: "90%",
    maxWidth: "500px",
    maxHeight: "90vh",
    overflow: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #e0e0e0",
  },
  title: {
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
  form: {
    padding: "24px",
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
  error: {
    padding: "12px",
    backgroundColor: "#fee",
    color: "#c33",
    borderRadius: "4px",
    fontSize: "14px",
  },
  actions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    paddingTop: "8px",
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
  submitButton: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600" as const,
    color: "white",
    backgroundColor: "#007bff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
