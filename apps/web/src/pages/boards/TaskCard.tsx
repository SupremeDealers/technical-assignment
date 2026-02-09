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

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";
  const isCompleted = task.status === "completed";

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "task-card",
        (isDragging || isSortableDragging) && "task-card-dragging",
        isCompleted && "task-card-completed",
        isOverdue && "task-card-overdue"
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
        {isCompleted && (
          <span className="badge badge-status-completed">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
        )}
      </div>

      <h4 className={clsx("task-card-title", isCompleted && "task-card-title-completed")}>
        {task.title}
      </h4>

      {task.description && (
        <p className="task-card-description">{task.description}</p>
      )}

      {task.labels && (
        <div className="task-card-labels">
          {task.labels.split(",").slice(0, 3).map((label, idx) => (
            <span key={idx} className="badge badge-label-sm">
              {label.trim()}
            </span>
          ))}
        </div>
      )}

      <div className="task-card-footer">
        <div className="task-card-meta">
          {task.due_date && (
            <span className={clsx("task-card-due", isOverdue && "task-card-due-overdue")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {formatDueDate(task.due_date)}
            </span>
          )}
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
