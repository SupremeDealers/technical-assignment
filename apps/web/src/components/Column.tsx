import { AiOutlineComment } from "react-icons/ai";
("use client");

import React from "react";

import { useState } from "react";
import { FiEdit2, FiTrash2, FiPlus, FiX } from "react-icons/fi";
import { toast } from "sonner";
import type { Column } from "./BoardView";

interface ColumnProps {
  column: Column;
  onCreateTask: (title: string) => void;
  onSelectTask: (taskId: string) => void;
  onMoveTask: (taskId: string, columnId: string, position: number) => void;
  onDeleteTask: (taskId: string) => void;
  onEditColumn: (newTitle: string) => void;
  onDeleteColumn: () => void;
  draggedTaskData?: { taskId: string; sourceColumnId: string } | null;
  onDragStart?: (taskId: string) => void;
  onDragEnd?: () => void;
}

export function ColumnComponent({
  column,
  onCreateTask,
  onSelectTask,
  onMoveTask,
  onDeleteTask,
  onEditColumn,
  onDeleteColumn,
  draggedTaskData,
  onDragStart,
  onDragEnd,
}: ColumnProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(column.title);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      toast.error("Task name cannot be empty");
      return;
    }

    setIsCreating(true);
    try {
      onCreateTask(newTaskTitle);
      setNewTaskTitle("");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveTitle = () => {
    if (!editedTitle.trim()) {
      toast.error("Column name cannot be empty");
      setIsEditingTitle(false);
      setEditedTitle(column.title);
      return;
    }

    if (editedTitle !== column.title) {
      onEditColumn(editedTitle);
    }
    setIsEditingTitle(false);
    setEditedTitle(column.title);
  };

  const handleDragStart = (taskId: string) => {
    onDragStart?.(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedTaskData) {
      (e.currentTarget as HTMLElement).classList.add("bg-bg-primary");
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).classList.remove("bg-bg-primary");
  };

  const handleDrop = (e: React.DragEvent, targetTaskId?: string) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).classList.remove("bg-bg-primary");

    if (!draggedTaskData) return;

    const targetPosition = targetTaskId
      ? column.tasks.findIndex((t) => t.id === targetTaskId)
      : column.tasks.length;

    onMoveTask(draggedTaskData.taskId, column.id, targetPosition);
    onDragEnd?.();
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-180px)] w-90 min-w-90 bg-bg-secondary border border-border rounded-lg overflow-hidden transition-all">
      {/* Column Header with Edit/Delete */}
      <div className="flex items-center justify-between p-md border-b border-border bg-bg-tertiary shrink-0 gap-sm">
        {isEditingTitle ? (
          <input
            autoFocus
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveTitle();
              if (e.key === "Escape") {
                setIsEditingTitle(false);
                setEditedTitle(column.title);
              }
            }}
            className="flex-1 px-sm py-xs bg-bg-secondary border border-primary rounded-md text-text-primary text-sm font-semibold"
          />
        ) : (
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-text-primary m-0 flex items-center gap-xs overflow-hidden text-ellipsis whitespace-nowrap">
              {column.title}
              <span className="text-xs text-text-muted font-normal shrink-0">
                ({column.tasks.length})
              </span>
            </h3>
          </div>
        )}
        <div className="flex gap-xs shrink-0">
          <button
            onClick={() => setIsEditingTitle(!isEditingTitle)}
            className="bg-none border-none text-text-muted cursor-pointer p-xs text-base transition-colors flex items-center justify-center rounded-sm hover:text-primary"
            title="Edit column"
          >
            <FiEdit2 size={14} />
          </button>
          <button
            onClick={onDeleteColumn}
            className="bg-none border-none text-text-muted dark:text-gray-400 cursor-pointer p-xs text-base transition-colors flex items-center justify-center rounded-sm hover:text-danger dark:hover:text-red-400"
            title="Delete column"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      {/* Add Task Form at Top */}
      <form
        onSubmit={handleCreateTask}
        className="flex gap-sm p-md border-b border-border shrink-0"
      >
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add task..."
          disabled={isCreating}
          className="flex-1 px-sm py-xs bg-bg-primary border border-border rounded-md text-text-primary text-xs focus:border-primary"
          onFocus={(e) => {
            (e.currentTarget as HTMLInputElement).style.borderColor = "#3b82f6";
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLInputElement).style.borderColor = "#475569";
          }}
        />
        <button
          type="submit"
          disabled={isCreating || !newTaskTitle.trim()}
          className={`px-md py-xs bg-primary text-white border-none rounded-md cursor-pointer font-medium text-xs transition-all flex items-center gap-xs ${
            isCreating || !newTaskTitle.trim()
              ? "opacity-60"
              : "opacity-100 hover:bg-primary-dark"
          }`}
        >
          <FiPlus size={14} />
        </button>
      </form>

      {/* Tasks Container - Scrollable */}
      <div
        className="flex-1 overflow-auto p-md flex flex-col gap-md scrollbar-thin"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e)}
      >
        {column.tasks.length === 0 ? (
          <div className="text-xs text-text-muted text-center p-lg">
            No tasks yet
          </div>
        ) : (
          column.tasks.map((task) => (
            <div
              key={task.id}
              className={`bg-bg-primary border border-border rounded-md p-md cursor-grab transition-all relative shrink-0 select-none hover:bg-bg-tertiary hover:border-primary ${
                draggedTaskData?.taskId === task.id
                  ? "opacity-50 cursor-grabbing"
                  : "opacity-100"
              }`}
              draggable
              onDragStart={() => handleDragStart(task.id)}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, task.id)}
              onClick={() => onSelectTask(task.id)}
            >
              <h4 className="m-0 text-sm text-text-primary font-medium mb-xs pr-lg wrap-break-word">
                {task.title}
              </h4>
              {task.description && (
                <p className="text-xs text-text-muted m-0 mb-2 wrap-break-word">
                  {task.description}
                </p>
              )}
              {task.comments && task.comments.length > 0 && (
                <p className="flex items-center text-xs text-text-muted m-0 wrap-break-word">
                  <AiOutlineComment className="mr-1" />
                  {task.comments?.length} comment
                  {task.comments.length > 1 ? "s" : ""}
                </p>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTask(task.id);
                }}
                className="absolute top-xs right-xs bg-none border-none text-text-muted cursor-pointer opacity-0 transition-opacity p-xs text-sm flex items-center rounded-sm hover:text-danger group-hover:opacity-100"
                title="Delete task"
              >
                <FiX size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
