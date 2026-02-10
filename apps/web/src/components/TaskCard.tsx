import React from "react";

interface TaskCardProps {
  task: any;
  columns: any[];
  onTaskClick: () => void;
  onMoveTask: (columnId: number) => void;
}

export function TaskCard({ task, onTaskClick }: TaskCardProps) {
  const priorityConfig: Record<string, { label: string; className: string; dot: string }> = {
    high: { label: "High", className: "badge-high", dot: "🔴" },
    medium: { label: "Medium", className: "badge-medium", dot: "🟡" },
    low: { label: "Low", className: "badge-low", dot: "🟢" },
  };

  const priority = priorityConfig[task.priority] ?? priorityConfig.medium;

  return (
    <div
      onClick={onTaskClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onTaskClick(); }}
      aria-label={`Task: ${task.title}`}
      style={{
        padding: "12px 14px",
        background: "var(--bg-input)",
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        transition: "all 0.2s var(--ease)",
        border: "1px solid transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--bg-hover)";
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--bg-input)";
        e.currentTarget.style.borderColor = "transparent";
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Priority badge */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
      }}>
        <span className={`badge ${priority.className}`}>
          {priority.dot} {priority.label}
        </span>
        <span style={{
          fontSize: "0.65rem",
          color: "var(--text-muted)",
          fontFamily: "var(--font-sans)",
        }}>
          #{task.id}
        </span>
      </div>

      {/* Title */}
      <h4 style={{
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        fontSize: "0.88rem",
        lineHeight: 1.4,
        color: "var(--text-primary)",
        margin: 0,
        marginBottom: task.description ? 6 : 0,
      }}>
        {task.title}
      </h4>

      {/* Description preview */}
      {task.description && (
        <p style={{
          fontSize: "0.78rem",
          color: "var(--text-muted)",
          lineHeight: 1.5,
          margin: 0,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical" as any,
          overflow: "hidden",
          fontStyle: "italic",
        }}>
          {task.description}
        </p>
      )}

      {/* Footer: assignee + date */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 10,
        paddingTop: 8,
        borderTop: "1px solid var(--border-light)",
      }}>
        {task.assignee_username ? (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            <div style={{
              width: 20,
              height: 20,
              background: "var(--accent-light)",
              color: "var(--accent-hover)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.6rem",
              fontWeight: 700,
            }}>
              {task.assignee_username.charAt(0).toUpperCase()}
            </div>
            <span style={{
              fontSize: "0.72rem",
              color: "var(--text-muted)",
            }}>
              {task.assignee_username}
            </span>
          </div>
        ) : (
          <span style={{
            fontSize: "0.72rem",
            color: "var(--text-muted)",
            fontStyle: "italic",
          }}>
            Unassigned
          </span>
        )}
        <span style={{
          fontSize: "0.65rem",
          color: "var(--text-muted)",
        }}>
          {new Date(task.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
