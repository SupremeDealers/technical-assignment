import React from "react";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from "../api/apiTypes";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: task.id,
    data: {
      type: 'Task',
      task
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 10 : 1
  };

  const priorityClass = `priority-badge priority-${task.priority.toLowerCase()}`;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="task-card" 
      onClick={onClick}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div className={priorityClass}>{task.priority}</div>
        <span style={{ fontSize: "12px", color: "#64748b" }}>
          {new Date(task.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </span>
      </div>
      <div className="task-title">{task.title}</div>
      {task.description && <div className="task-desc">{task.description}</div>}
      
      <div className="task-meta">
        {task._count?.comments !== undefined && task._count.comments > 0 && (
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            💬 {task._count.comments}
          </span>
        )}
        {task.assignedTo && (
          <div style={{ 
            width: "20px", 
            height: "20px", 
            borderRadius: "50%", 
            background: "#e2e8f0", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            fontSize: "0.625rem",
            fontWeight: "bold",
            marginLeft: "auto"
          }}>
            {task.assignedTo.email.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
