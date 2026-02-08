import React from "react";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    _count?: {
      comments: number;
    };
  };
  onClick: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <div className="task-card" onClick={onClick}>
      <div className="task-title">{task.title}</div>
      <div className="task-meta">
        {task._count?.comments !== undefined && (
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            💬 {task._count.comments}
          </span>
        )}
        <span>ID: {task.id.slice(-4)}</span>
      </div>
    </div>
  );
}
