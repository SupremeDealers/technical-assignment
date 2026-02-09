import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../lib/auth-context";
import { api } from "../lib/api";
import { TaskCard } from "./TaskCard";
import { useState } from "react";

interface ColumnProps {
  column: {
    id: number;
    boardId: number;
    title: string;
    position: number;
    taskCount: number;
    createdAt: string;
    updatedAt: string;
  };
  onTaskClick: (task: any) => void;
  onMoveTask: (taskId: number, newColumnId: number) => void;
  onCreateTask: (columnId: number) => void;
  columns: Array<{ id: number; title: string }>;
  searchQuery: string;
}

export function Column({
  column,
  onTaskClick,
  onMoveTask,
  onCreateTask,
  columns,
  searchQuery,
}: ColumnProps) {
  const { token } = useAuth();
  const [sortBy, setSortBy] = useState<"createdAt" | "priority">("createdAt");

  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks", column.id, searchQuery, sortBy],
    queryFn: () =>
      api.getColumnTasks(
        column.id,
        {
          search: searchQuery || undefined,
          sort: sortBy,
        },
        token!
      ),
    enabled: !!token,
  });

  return (
    <div style={styles.column}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          {column.title}{" "}
          <span style={styles.count}>
            {data?.pagination.total ?? column.taskCount}
          </span>
        </h3>
        <div style={styles.headerActions}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "createdAt" | "priority")}
            style={styles.sortSelect}
            title="Sort by"
          >
            <option value="createdAt">Latest</option>
            <option value="priority">Priority</option>
          </select>
          <button
            onClick={() => onCreateTask(column.id)}
            style={styles.addButton}
            title="Add task"
          >
            +
          </button>
        </div>
      </div>

      <div style={styles.taskList}>
        {isLoading && <div style={styles.loading}>Loading tasks...</div>}
        {error && <div style={styles.error}>Failed to load tasks</div>}
        {data?.tasks.length === 0 && (
          <div style={styles.empty}>
            {searchQuery ? "No tasks match your search" : "No tasks yet"}
          </div>
        )}
        {data?.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onTaskClick={onTaskClick}
            onMoveTask={onMoveTask}
            columns={columns}
          />
        ))}
      </div>
    </div>
  );
}

const styles = {
  column: {
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    padding: "16px",
    minWidth: "300px",
    maxWidth: "350px",
    display: "flex",
    flexDirection: "column" as const,
    maxHeight: "calc(100vh - 200px)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  title: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "600" as const,
    color: "#333",
  },
  count: {
    fontSize: "14px",
    fontWeight: "400" as const,
    color: "#999",
  },
  headerActions: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  sortSelect: {
    fontSize: "12px",
    padding: "4px 6px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    backgroundColor: "white",
    cursor: "pointer",
  },
  addButton: {
    width: "28px",
    height: "28px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#007bff",
    color: "white",
    fontSize: "18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  taskList: {
    flex: 1,
    overflowY: "auto" as const,
    paddingRight: "4px",
  },
  loading: {
    textAlign: "center" as const,
    padding: "20px",
    color: "#666",
    fontSize: "14px",
  },
  error: {
    textAlign: "center" as const,
    padding: "20px",
    color: "#dc3545",
    fontSize: "14px",
  },
  empty: {
    textAlign: "center" as const,
    padding: "40px 20px",
    color: "#999",
    fontSize: "14px",
  },
};
