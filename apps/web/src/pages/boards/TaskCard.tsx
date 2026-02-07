import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { TaskWithDetails } from "../../api/client";
import "./TaskCard.css";

interface TaskCardProps {
  task: TaskWithDetails;
  onClick: () => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onClick, isDragging = false }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const priorityLabel = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "task-card",
        (isDragging || isSortableDragging) && "task-card-dragging"
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Task: ${task.title}`}
      {...attributes}
      {...listeners}
    >
      <div className="task-card-header">
        <span className={`badge badge-priority-${task.priority}`}>
          {priorityLabel[task.priority]}
        </span>
      </div>

      <h4 className="task-card-title">{task.title}</h4>

      {task.description && (
        <p className="task-card-description">{task.description}</p>
      )}

      <div className="task-card-footer">
        <div className="task-card-meta">
          {task.comment_count > 0 && (
            <span className="task-card-comments" title={`${task.comment_count} comments`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {task.comment_count}
            </span>
          )}
        </div>

        {task.assignee && (
          <div
            className="avatar avatar-sm"
            title={task.assignee.name}
            aria-label={`Assigned to ${task.assignee.name}`}
          >
            {getInitials(task.assignee.name)}
          </div>
        )}
      </div>
    </div>
  );
}
