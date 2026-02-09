import { useState } from "react";

interface Task {
  id: number;
  columnId: number;
  title: string;
  description: string | null;
  priority: string;
  createdBy: { id: number; name: string; email: string };
  assignedTo: { id: number; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

interface TaskCardProps {
  task: Task;
  onTaskClick: (task: Task) => void;
  onMoveTask: (taskId: number, newColumnId: number) => void;
  columns: Array<{ id: number; title: string }>;
}

export function TaskCard({ task, onTaskClick, onMoveTask, columns }: TaskCardProps) {
  const [isMoving, setIsMoving] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#dc3545";
      case "medium":
        return "#ffc107";
      case "low":
        return "#28a745";
      default:
        return "#6c757d";
    }
  };

  const handleMove = (newColumnId: number) => {
    setIsMoving(true);
    onMoveTask(task.id, newColumnId);
  };

  return (
    <div
      style={{
        ...styles.card,
        opacity: isMoving ? 0.6 : 1,
      }}
    >
      <div style={styles.header}>
        <div
          style={{
            ...styles.priorityBadge,
            backgroundColor: getPriorityColor(task.priority),
          }}
        >
          {task.priority}
        </div>
        <select
          value={task.columnId}
          onChange={(e) => handleMove(Number(e.target.value))}
          style={styles.moveSelect}
          disabled={isMoving}
          title="Move to column"
        >
          {columns.map((col) => (
            <option key={col.id} value={col.id}>
              {col.title}
            </option>
          ))}
        </select>
      </div>

      <div onClick={() => onTaskClick(task)} style={styles.clickable}>
        <h4 style={styles.title}>{task.title}</h4>
        {task.description && (
          <p style={styles.description}>{task.description}</p>
        )}
      </div>

      <div style={styles.footer}>
        {task.assignedTo ? (
          <div style={styles.assignee}>
            <span style={styles.avatar}>
              {task.assignedTo.name.charAt(0).toUpperCase()}
            </span>
            <span style={styles.assigneeName}>{task.assignedTo.name}</span>
          </div>
        ) : (
          <div style={styles.unassigned}>Unassigned</div>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "white",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "12px",
    transition: "all 0.2s",
    cursor: "pointer",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  priorityBadge: {
    fontSize: "11px",
    fontWeight: "600" as const,
    color: "white",
    padding: "2px 8px",
    borderRadius: "12px",
    textTransform: "uppercase" as const,
  },
  moveSelect: {
    fontSize: "11px",
    padding: "2px 4px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    backgroundColor: "white",
    cursor: "pointer",
  },
  clickable: {
    cursor: "pointer",
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "14px",
    fontWeight: "600" as const,
    color: "#333",
  },
  description: {
    margin: 0,
    fontSize: "13px",
    color: "#666",
    lineHeight: "1.4",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
  },
  footer: {
    marginTop: "12px",
    paddingTop: "8px",
    borderTop: "1px solid #f0f0f0",
  },
  assignee: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  avatar: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#007bff",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "600" as const,
  },
  assigneeName: {
    fontSize: "12px",
    color: "#666",
  },
  unassigned: {
    fontSize: "12px",
    color: "#999",
    fontStyle: "italic" as const,
  },
};
