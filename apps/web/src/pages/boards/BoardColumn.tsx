import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { createTask, ColumnWithTaskCount, TaskWithDetails } from "../../api/client";
import { TaskCard } from "./TaskCard";
import { Button } from "../../components/Button";
import { Input, Textarea, Select } from "../../components/Input";
import "./BoardColumn.css";

interface BoardColumnProps {
  column: ColumnWithTaskCount;
  tasks: TaskWithDetails[];
  isLoading: boolean;
  onTaskClick: (taskId: string) => void;
  boardId: string;
}

export function BoardColumn({
  column,
  tasks,
  isLoading,
  onTaskClick,
  boardId,
}: BoardColumnProps) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const createTaskMutation = useMutation({
    mutationFn: () =>
      createTask(token!, column.id, {
        title: newTaskTitle,
        description: newTaskDescription || undefined,
        priority: newTaskPriority,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-tasks", boardId] });
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      setIsAddingTask(false);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskPriority("medium");
    },
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    createTaskMutation.mutate();
  };

  const handleCancelAdd = () => {
    setIsAddingTask(false);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskPriority("medium");
  };

  return (
    <div className={`board-column ${isOver ? "board-column-over" : ""}`}>
      <div className="board-column-header">
        <h3 className="board-column-title">
          {column.name}
          <span className="board-column-count">{tasks.length}</span>
        </h3>
      </div>

      <div ref={setNodeRef} className="board-column-content">
        {isLoading ? (
          <div className="board-column-loading">
            <div className="spinner" />
          </div>
        ) : tasks.length === 0 && !isAddingTask ? (
          <div className="board-column-empty">
            <p>No tasks</p>
          </div>
        ) : (
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="board-column-tasks">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick(task.id)}
                />
              ))}
            </div>
          </SortableContext>
        )}

        {isAddingTask && (
          <form onSubmit={handleAddTask} className="add-task-form">
            <Input
              name="title"
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              autoFocus
              required
            />
            <Textarea
              name="description"
              placeholder="Description (optional)"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              rows={2}
            />
            <Select
              name="priority"
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as "low" | "medium" | "high")}
              options={[
                { value: "low", label: "Low Priority" },
                { value: "medium", label: "Medium Priority" },
                { value: "high", label: "High Priority" },
              ]}
            />
            <div className="add-task-actions">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={createTaskMutation.isPending}
              >
                Add Task
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelAdd}
                disabled={createTaskMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {!isAddingTask && (
        <button
          className="board-column-add"
          onClick={() => setIsAddingTask(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add a task
        </button>
      )}
    </div>
  );
}
