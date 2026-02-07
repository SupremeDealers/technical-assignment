import { type Task, type Column } from "../lib/api";

interface TaskCardProps {
  task: Task;
  columns: Column[];
  onSelect: () => void;
  onMove: (task: Task, newColumnId: number) => void;
}

export function TaskCard({ task, columns, onSelect, onMove }: TaskCardProps) {
  const priorityColors = {
    low: "#28a745",
    medium: "#ffc107",
    high: "#dc3545",
  };

  return (
    <div
      style={{
        background: "white",
        padding: "15px",
        borderRadius: "6px",
        border: "1px solid #ddd",
        cursor: "pointer",
      }}
      onClick={onSelect}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
        <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>{task.title}</h3>
        <span
          style={{
            background: priorityColors[task.priority],
            color: "white",
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "10px",
            textTransform: "uppercase",
          }}
        >
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p style={{ margin: "8px 0", fontSize: "13px", color: "#666", lineHeight: "1.4" }}>
          {task.description.length > 100
            ? task.description.substring(0, 100) + "..."
            : task.description}
        </p>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
        <span style={{ fontSize: "11px", color: "#999" }}>
          {task.createdBy.name}
        </span>

        <select
          value={task.columnId}
          onChange={(e) => {
            e.stopPropagation();
            onMove(task, Number(e.target.value));
          }}
          onClick={(e) => e.stopPropagation()}
          style={{
            padding: "4px 8px",
            fontSize: "11px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            cursor: "pointer",
          }}
        >
          {columns.map((col) => (
            <option key={col.id} value={col.id}>
              {col.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
