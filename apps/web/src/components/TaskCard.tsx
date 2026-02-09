import { type Task } from "../api/client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = {
    low: "#4caf50",
    medium: "#ff9800",
    high: "#f44336",
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: "white",
        padding: "1rem",
        marginBottom: "0.75rem",
        borderRadius: "8px",
        border: "1px solid #e4e6eb",
        cursor: "grab",
        userSelect: "none",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        transition: "all 0.2s ease",
      }}
      {...attributes}
      {...listeners}
      onMouseEnter={(e) => {
        if (!isDragging) {
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.borderColor = "#d0d3d9";
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.04)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.borderColor = "#e4e6eb";
        }
      }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        style={{ cursor: "pointer" }}
      >
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "0.625rem",
          gap: "0.5rem",
        }}>
          <h4 style={{
            margin: 0,
            fontSize: "0.9375rem",
            fontWeight: 600,
            color: "#1c1e21",
            lineHeight: 1.3,
          }}>
            {task.title}
          </h4>
          <span
            style={{
              fontSize: "0.6875rem",
              padding: "0.25rem 0.625rem",
              borderRadius: "12px",
              backgroundColor: priorityColors[task.priority],
              color: "white",
              fontWeight: 600,
              marginLeft: "0.5rem",
              flexShrink: 0,
              textTransform: "uppercase",
              letterSpacing: "0.02em",
            }}
          >
            {task.priority}
          </span>
        </div>
        {task.description && (
          <p
            style={{
              margin: 0,
              fontSize: "0.8125rem",
              color: "#65676b",
              lineHeight: 1.4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {task.description}
          </p>
        )}
      </div>
    </div>
  );
}
