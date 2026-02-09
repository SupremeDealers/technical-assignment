import { type Column, type Task } from "../api/client";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskCard } from "./TaskCard";

interface BoardColumnProps {
  column: Column;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (columnId: number) => void;
}

export function BoardColumn({ column, tasks, onTaskClick, onAddTask }: BoardColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "1.25rem",
        minWidth: "320px",
        maxWidth: "320px",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        border: "1px solid #e4e6eb",
      }}
    >
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.25rem",
        paddingBottom: "0.75rem",
        borderBottom: "2px solid #f0f2f5",
      }}>
        <h3 style={{
          margin: 0,
          fontSize: "1rem",
          fontWeight: 700,
          color: "#1c1e21",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}>
          {column.name}
          <span style={{
            fontSize: "0.8rem",
            fontWeight: 500,
            color: "#65676b",
            backgroundColor: "#f0f2f5",
            padding: "0.125rem 0.5rem",
            borderRadius: "12px",
          }}>
            {tasks.length}
          </span>
        </h3>
        <button
          onClick={() => onAddTask(column.id)}
          aria-label={`Add task to ${column.name}`}
          style={{
            backgroundColor: "#0084ff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            width: "28px",
            height: "28px",
            fontSize: "1.125rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            transition: "all 0.2s ease",
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#0073e6";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#0084ff";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          +
        </button>
      </div>

      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          minHeight: "120px",
        }}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div
              style={{
                padding: "2rem 1rem",
                textAlign: "center",
                color: "#b0b3b8",
                fontSize: "0.875rem",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "2px dashed #e4e6eb",
              }}
            >
              No tasks yet
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task)}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
