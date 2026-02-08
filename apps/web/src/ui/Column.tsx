import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { getColumnTasks, createTask } from "../api/tasks";
import { TaskCard } from "./TaskCard";
import { TaskModal } from "./TaskModal";
import { ColumnProps } from "./uiTypes";



export function Column({ column, search }: ColumnProps) {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const { data: tasksData, isPlaceholderData } = useQuery({
    queryKey: ["tasks", column.id, search],
    queryFn: () => getColumnTasks(column.id, { search }),
    placeholderData: keepPreviousData,
  });

  const addTaskMutation = useMutation({
    mutationFn: (title: string) => createTask(column.id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", column.id] });
      setNewTaskTitle("");
      setIsAdding(false);
    },
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTaskMutation.mutate(newTaskTitle);
    }
  };

  return (
    <div className="column">
      <div className="column-header">
        <span>{column.title}</span>
        <span style={{ fontSize: "0.75rem", background: "#e2e8f0", padding: "2px 8px", borderRadius: "10px" }}>
          {tasksData?.pagination.total || 0}
        </span>
      </div>
      
      <div className="task-list" style={{ opacity: isPlaceholderData ? 0.6 : 1, transition: "opacity 0.2s" }}>
        {tasksData?.tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onClick={() => setSelectedTask(task)}
          />
        ))}
        
        {isAdding ? (
          <form onSubmit={handleAddTask} style={{ marginBottom: "0.75rem" }}>
            <input
              autoFocus
              className="form-input"
              style={{ marginBottom: "0.5rem" }}
              placeholder="What needs to be done?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onBlur={() => !newTaskTitle && setIsAdding(false)}
            />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="submit" className="btn" style={{ padding: "0.4rem" }}>Add</button>
              <button type="button" onClick={() => setIsAdding(false)} style={{ background: "none", border: "none", fontSize: "0.875rem" }}>Cancel</button>
            </div>
          </form>
        ) : (
          <button 
            className="add-task-btn" 
            onClick={() => setIsAdding(true)}
            style={{
              width: "100%",
              padding: "0.5rem",
              background: "none",
              border: "1px dashed var(--border)",
              borderRadius: "8px",
              color: "var(--text-muted)",
              textAlign: "left",
              fontSize: "0.875rem"
            }}
          >
            + Add a task
          </button>
        )}
      </div>

      {selectedTask && (
        <TaskModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
        />
      )}
    </div>
  );
}
