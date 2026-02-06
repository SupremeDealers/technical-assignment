import React from "react";

interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
}

export function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const createdDate = new Date(task.createdAt).toLocaleDateString();

  return (
    <div
      onClick={onClick}
      style={{
        padding: 12,
        backgroundColor: "#fff",
        border: "1px solid #ddd",
        borderRadius: 6,
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as any).style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
        (e.currentTarget as any).style.borderColor = "#0066cc";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as any).style.boxShadow = "none";
        (e.currentTarget as any).style.borderColor = "#ddd";
      }}
    >
      <p style={{ margin: "0 0 8px 0", fontSize: 14, fontWeight: 500 }}>
        {task.title}
      </p>
      {task.description && (
        <p style={{ margin: 0, fontSize: 12, color: "#666", lineHeight: 1.4 }}>
          {task.description.substring(0, 60)}
          {task.description.length > 60 ? "..." : ""}
        </p>
      )}
      <p style={{ margin: "8px 0 0 0", fontSize: 11, color: "#999" }}>
        {createdDate}
      </p>
    </div>
  );
}
