import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { createTask, createChecklistItem, ColumnWithTaskCount, TaskWithDetails, Priority, ColumnHeatmapData } from "../../api/client";
import { TaskCard } from "./TaskCard";
import { TaskTemplates } from "./TaskTemplates";
import { Button } from "../../components/Button";
import { Input, Textarea, Select } from "../../components/Input";
import { FiAlertTriangle, FiClipboard, FiThermometer, FiClock, FiMessageCircle } from "react-icons/fi";
import "./BoardColumn.css";
import "./TaskTemplates.css";

interface BoardColumnProps {
  column: ColumnWithTaskCount;
  tasks: TaskWithDetails[];
  isLoading: boolean;
  onTaskClick: (taskId: string) => void;
  boardId: string;
  heatmapData?: ColumnHeatmapData;
}

export function BoardColumn({
  column,
  tasks,
  isLoading,
  onTaskClick,
  boardId,
  heatmapData,
}: BoardColumnProps) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [newTaskLabels, setNewTaskLabels] = useState("");
  const [pendingChecklist, setPendingChecklist] = useState<string[]>([]);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const [createError, setCreateError] = useState<string | null>(null);

  const createTaskMutation = useMutation({
    mutationFn: async () => {
      const result = await createTask(token!, column.id, {
        title: newTaskTitle,
        description: newTaskDescription || undefined,
        priority: newTaskPriority,
        labels: newTaskLabels || null,
      });
      
      // If we have pending checklist items (from template), create them
      if (pendingChecklist.length > 0 && result.task) {
        for (let i = 0; i < pendingChecklist.length; i++) {
          await createChecklistItem(token!, result.task.id, pendingChecklist[i], i);
        }
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-tasks", boardId] });
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      queryClient.invalidateQueries({ queryKey: ["board-activities", boardId] });
      setIsAddingTask(false);
      resetForm();
      setCreateError(null);
    },
    onError: (error: Error & { code?: string }) => {
      if (error.code === "DUPLICATE_TITLE") {
        setCreateError("A task with this title already exists in this column");
      } else if (error.code === "COLUMN_TASK_LIMIT_REACHED") {
        setCreateError("This column has reached its task limit");
      } else {
        setCreateError(error.message || "Failed to create task");
      }
    },
  });

  const resetForm = () => {
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskPriority("medium");
    setNewTaskLabels("");
    setPendingChecklist([]);
    setCreateError(null);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    createTaskMutation.mutate();
  };

  const handleCancelAdd = () => {
    setIsAddingTask(false);
    resetForm();
  };

  const handleSelectTemplate = (template: {
    title: string;
    description: string;
    priority: Priority;
    labels: string | null;
    checklist_items?: string[];
  }) => {
    setNewTaskTitle(template.title);
    setNewTaskDescription(template.description);
    setNewTaskPriority(template.priority);
    setNewTaskLabels(template.labels || "");
    setPendingChecklist(template.checklist_items || []);
    setShowTemplates(false);
    setIsAddingTask(true);
  };

  // WIP Limit check
  const wipLimit = column.max_tasks;
  const taskCount = tasks.length;
  const isAtLimit = wipLimit !== null && taskCount >= wipLimit;
  const isNearLimit = wipLimit !== null && taskCount >= wipLimit - 1;

  // Heatmap styling
  const heatLevel = heatmapData?.heat_level || "cool";
  const heatScore = heatmapData?.heat_score || 0;
  const frictionReasons = heatmapData?.friction_reasons || [];

  const getHeatmapStyle = () => {
    if (heatLevel === "hot") {
      return {
        "--heat-color": "rgba(239, 68, 68, 0.15)",
        "--heat-border-color": "rgba(239, 68, 68, 0.4)",
      } as React.CSSProperties;
    } else if (heatLevel === "warm") {
      return {
        "--heat-color": "rgba(245, 158, 11, 0.12)",
        "--heat-border-color": "rgba(245, 158, 11, 0.3)",
      } as React.CSSProperties;
    }
    return {};
  };

  return (
    <div 
      className={`board-column ${isOver ? "board-column-over" : ""} ${isAtLimit ? "board-column-at-limit" : ""} ${heatLevel !== "cool" ? `board-column-heat-${heatLevel}` : ""}`}
      style={getHeatmapStyle()}
    >
      <div className="board-column-header">
        <h3 className="board-column-title">
          {column.name}
          <span className={`board-column-count ${isAtLimit ? "at-limit" : isNearLimit ? "near-limit" : ""}`}>
            {taskCount}{wipLimit !== null ? ` / ${wipLimit}` : ""}
          </span>
        </h3>
        <div className="board-column-indicators">
          {heatLevel !== "cool" && heatmapData && (
            <div className="heat-indicator-wrapper">
              <span 
                className={`heat-indicator heat-${heatLevel}`} 
              >
                <FiThermometer />
                {heatLevel === "hot" && <span className="heat-badge">!</span>}
              </span>
              <div className="heat-tooltip">
                <div className="heat-tooltip-header">
                  <FiThermometer />
                  <span>{heatLevel === "hot" ? "High Friction" : "Moderate Friction"}</span>
                </div>
                <div className="heat-tooltip-stats">
                  <div className="heat-stat">
                    <FiClock />
                    <span>
                      {heatmapData.avg_time_in_column_hours >= 24 
                        ? `${Math.round(heatmapData.avg_time_in_column_hours / 24)}d avg`
                        : `${Math.round(heatmapData.avg_time_in_column_hours)}h avg`
                      }
                    </span>
                  </div>
                  <div className="heat-stat">
                    <FiMessageCircle />
                    <span>{heatmapData.avg_comments_per_task} comments/task</span>
                  </div>
                </div>
                {frictionReasons.length > 0 && (
                  <div className="heat-tooltip-reasons">
                    {frictionReasons.map((reason, idx) => (
                      <div key={idx} className="heat-reason">• {reason}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {isAtLimit && (
            <span className="wip-limit-warning" title="WIP limit reached">
              <FiAlertTriangle />
            </span>
          )}
        </div>
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
            <Input
              name="labels"
              placeholder="Labels (comma-separated)"
              value={newTaskLabels}
              onChange={(e) => setNewTaskLabels(e.target.value)}
            />
            {pendingChecklist.length > 0 && (
              <div className="pending-checklist">
                <span className="pending-checklist-label"><FiClipboard /> {pendingChecklist.length} checklist items from template</span>
              </div>
            )}
            {createError && (
              <div className="create-task-error">
                <FiAlertTriangle /> {createError}
              </div>
            )}
            <div className="add-task-actions">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={createTaskMutation.isPending}
                disabled={isAtLimit}
              >
                {isAtLimit ? "Column Full" : "Add Task"}
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
        <div className="board-column-footer">
          <button
            className="board-column-add"
            onClick={() => setIsAddingTask(true)}
            disabled={isAtLimit}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add a task
          </button>
          <button
            className="board-column-template"
            onClick={() => setShowTemplates(true)}
            title="Use template"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </button>
        </div>
      )}

      {showTemplates && (
        <TaskTemplates
          boardId={boardId}
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  );
}
