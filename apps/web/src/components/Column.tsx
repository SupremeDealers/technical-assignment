import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { TaskCard } from "./TaskCard";

interface ColumnProps {
  column: any;
  boardId: number;
  searchTerm: string;
  onTaskClick: (taskId: number) => void;
  onCreateTask: () => void;
  animationDelay: number;
}

export function Column({ column, boardId, searchTerm, onTaskClick, onCreateTask, animationDelay }: ColumnProps) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["tasks", column.id, searchTerm],
    queryFn: () => api.getTasks(column.id, { search: searchTerm || undefined, limit: 50 }),
  });

  const moveTaskMutation = useMutation({
    mutationFn: ({ taskId, columnId }: { taskId: number; columnId: number }) =>
      api.updateTask(taskId, { column_id: columnId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["columns", boardId] });
    },
  });

  const tasks = data?.tasks ?? [];

  const columnColors: Record<string, string> = {
    "Backlog": "#f0e8d8",
    "In Progress": "#e8f0ff",
    "Review": "#f0e6f6",
    "Done": "#e6f5ec",
  };

  const columnIcons: Record<string, string> = {
    "Backlog": "📋",
    "In Progress": "⚡",
    "Review": "👁",
    "Done": "✓",
  };

  const headerBg = columnColors[column.name] || "var(--bg-column)";

  return (
    <div
      style={{
        width: 310,
        minWidth: 310,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        maxHeight: "calc(100vh - 120px)",
        animation: `fadeIn 0.4s var(--ease) both`,
        animationDelay: `${animationDelay}ms`,
      }}
    >
      {/* Column header */}
      <div style={{
        background: headerBg,
        borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        border: "1px solid var(--border-light)",
        borderBottom: "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "1rem" }}>
            {columnIcons[column.name] || "📌"}
          </span>
          <h3 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "0.95rem",
            fontWeight: 600,
            margin: 0,
          }}>
            {column.name}
          </h3>
          <span style={{
            background: "rgba(0,0,0,0.08)",
            color: "var(--text-secondary)",
            padding: "1px 8px",
            borderRadius: 100,
            fontSize: "0.7rem",
            fontWeight: 600,
          }}>
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onCreateTask}
          className="btn-icon"
          style={{
            background: "rgba(255,255,255,0.6)",
            borderRadius: "var(--radius-sm)",
            width: 28,
            height: 28,
            fontSize: "1.1rem",
            color: "var(--text-secondary)",
          }}
          aria-label={`Add task to ${column.name}`}
        >
          +
        </button>
      </div>

      {/* Tasks list */}
      <div style={{
        flex: 1,
        background: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderTop: "none",
        borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
        padding: "8px",
        overflowY: "auto",
        minHeight: 120,
      }}>
        {isLoading ? (
          <div style={{
            display: "flex",
            justifyContent: "center",
            padding: 24,
          }}>
            <div className="spinner" />
          </div>
        ) : tasks.length === 0 ? (
          <div style={{
            padding: "32px 16px",
            textAlign: "center",
          }}>
            <p style={{
              color: "var(--text-muted)",
              fontStyle: "italic",
              fontSize: "0.85rem",
              margin: 0,
            }}>
              {searchTerm ? "No matching tasks" : "No tasks yet"}
            </p>
            {!searchTerm && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={onCreateTask}
                style={{
                  marginTop: 8,
                  fontStyle: "italic",
                  color: "var(--accent)",
                }}
              >
                + Create one
              </button>
            )}
          </div>
        ) : (
          <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {tasks.map((task: any) => (
              <TaskCard
                key={task.id}
                task={task}
                columns={[]}
                onTaskClick={() => onTaskClick(task.id)}
                onMoveTask={(columnId: number) =>
                  moveTaskMutation.mutate({ taskId: task.id, columnId })
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
