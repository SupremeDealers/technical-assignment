import React, { useState } from "react";
import { Column, Task } from "../types";
import ColumnCard from "./ColumnCard";

interface KanbanBoardProps {
  columns: Column[];
  onTaskMove: ({
    task_id,
    to_column_id,
    new_order,
  }: {
    task_id: string;
    to_column_id: string;
    new_order: number;
  }) => void;
}

export const KanbanBoard = ({ columns, onTaskMove }: KanbanBoardProps) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedFromColumn, setDraggedFromColumn] = useState<string | null>(
    null,
  );
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredColumnId, setHoveredColumnId] = useState<string | null>(null);

  const handleDragStart = (
    e: React.DragEvent,
    task: Task,
    columnId: string,
  ) => {
    setDraggedTask(task);
    setDraggedFromColumn(columnId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragOverDropZone = (
    e: React.DragEvent,
    columnId: string,
    index: number,
  ) => {
    e.preventDefault();
    if (draggedTask) {
      console.log("Hovering over drop zone", { columnId, index });
      setHoveredIndex(index);
      setHoveredColumnId(columnId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();

    if (!draggedTask || !draggedFromColumn) return;

    const insertIndex = hoveredIndex ?? 0;
    console.log("Final drop details", {
      hoveredIndex: hoveredIndex ?? "end",
      new_order: insertIndex,
    });

    onTaskMove({
      task_id: draggedTask.task_id,
      to_column_id: targetColumnId,
      new_order: insertIndex,
    });

    setDraggedTask(null);
    setDraggedFromColumn(null);
    setHoveredIndex(null);
    setHoveredColumnId(null);
  };

  let grid_cols = "grid-cols-1";
  if (columns.length === 2) grid_cols = "grid-cols-2";
  else if (columns.length === 3) grid_cols = "grid-cols-3";
  else if (columns.length >= 4) grid_cols = "grid-cols-4";
  return (
    <div className="flex flex-col py-2 gap-2 h-[calc(100vh-10rem)]">
      <div className={`grid h-full ${grid_cols} gap-4`}>
        {columns.map((column, columnIndex) => (
          <ColumnCard
            column={column}
            columnIndex={columnIndex}
            handleDrop={handleDrop}
            hoveredColumnId={hoveredColumnId}
            handleDragOverDropZone={handleDragOverDropZone}
            setHoveredColumnId={setHoveredColumnId}
            key={column.column_id}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            hoveredIndex={hoveredIndex}
          />
        ))}
      </div>
    </div>
  );
};
