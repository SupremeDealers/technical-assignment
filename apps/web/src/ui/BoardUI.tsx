import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskAPI, columnAPI } from "../api";
import { TaskModal } from "./TaskModal";
import { TaskCard } from "./TaskCard";
// import { TaskCard } from "./TaskCard";
// import { TaskModal } from "./TaskModal";

interface Task {
  id: string;
  title: string;
  description?: string;
  order: number;
  columnId: string;
  createdAt: string;
}

interface Column {
  id: string;
  name: string;
  order: number;
  tasks: Task[];
}

interface Board {
  id: string;
  name: string;
  columns: Column[];
}

export function BoardUI({ board }: { board: Board }) {
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newColumnName, setNewColumnName] = useState("");
  const [showNewColumnForm, setShowNewColumnForm] = useState(false);

  const createColumnMutation = useMutation({
    mutationFn: (name: string) => columnAPI.create(board.id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", board.id] });
      setNewColumnName("");
      setShowNewColumnForm(false);
    },
  });

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (newColumnName.trim()) {
      createColumnMutation.mutate(newColumnName);
    }
  };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>{board.name}</h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 16,
      }}>
        {board.columns?.map((column) => (
          <ColumnView
            key={column.id}
            column={column}
            boardId={board.id}
            onTaskSelect={setSelectedTask}
          />
        ))}

        {/* Add column card */}
        <div style={{
          minWidth: 320,
          backgroundColor: "#f9f9f9",
          border: "2px dashed #ddd",
          borderRadius: 8,
          padding: 16,
        }}>
          {showNewColumnForm ? (
            <form onSubmit={handleAddColumn}>
              <input
                type="text"
                placeholder="Column name..."
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                autoFocus
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  marginBottom: 8,
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="submit"
                  disabled={createColumnMutation.isPending}
                  style={{
                    flex: 1,
                    padding: 8,
                    backgroundColor: "#0066cc",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewColumnForm(false)}
                  style={{
                    flex: 1,
                    padding: 8,
                    backgroundColor: "#f0f0f0",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowNewColumnForm(true)}
              style={{
                width: "100%",
                padding: 12,
                backgroundColor: "transparent",
                border: "none",
                color: "#0066cc",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              + Add Column
            </button>
          )}
        </div>
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          boardId={board.id}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}

function ColumnView({
  column,
  boardId,
  onTaskSelect,
}: {
  column: Column;
  boardId: string;
  onTaskSelect: (task: Task) => void;
}) {
  const queryClient = useQueryClient();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

  const createTaskMutation = useMutation({
    mutationFn: (title: string) =>
      taskAPI.create(column.id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      setNewTaskTitle("");
      setShowNewTaskForm(false);
    },
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      createTaskMutation.mutate(newTaskTitle);
    }
  };

  return (
    <div style={{
      backgroundColor: "#fff",
      borderRadius: 8,
      border: "1px solid #ddd",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      height: "fit-content",
      maxWidth: 320,
    }}>
      <div style={{
        padding: 16,
        borderBottom: "1px solid #eee",
        backgroundColor: "#f9f9f9",
      }}>
        <h3 style={{ margin: "0 0 4px 0", fontSize: 16 }}>
          {column.name}
        </h3>
        <p style={{ margin: 0, fontSize: 12, color: "#999" }}>
          {column.tasks?.length || 0} tasks
        </p>
      </div>

      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}>
        {column.tasks?.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskSelect(task)}
          />
        ))}
      </div>

      <div style={{ padding: 12, borderTop: "1px solid #eee" }}>
        {showNewTaskForm ? (
          <form onSubmit={handleAddTask}>
            <textarea
              placeholder="Task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              autoFocus
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ccc",
                borderRadius: 4,
                marginBottom: 8,
                fontSize: 14,
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="submit"
                disabled={createTaskMutation.isPending}
                style={{
                  flex: 1,
                  padding: 8,
                  backgroundColor: "#0066cc",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowNewTaskForm(false)}
                style={{
                  flex: 1,
                  padding: 8,
                  backgroundColor: "#f0f0f0",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowNewTaskForm(true)}
            style={{
              width: "100%",
              padding: 8,
              backgroundColor: "#f0f0f0",
              border: "1px solid #ddd",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 12,
              color: "#666",
            }}
          >
            + Add task
          </button>
        )}
      </div>
    </div>
  );
}
