import { useDroppable } from "@dnd-kit/core";
import { type Column } from "../lib/api";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";

interface DroppableColumnProps {
  column: Column;
  taskCount: number;
  children: React.ReactNode;
}

const columnStyles: Record<string, { bg: string; border: string; badgeVariant: any }> = {
  "To Do": {
    bg: "bg-yellow-50",
    border: "border-yellow-300",
    badgeVariant: "warning",
  },
  "In Progress": {
    bg: "bg-blue-50",
    border: "border-blue-300",
    badgeVariant: "info",
  },
  "Done": {
    bg: "bg-green-50",
    border: "border-green-300",
    badgeVariant: "success",
  },
};

export function DroppableColumn({ column, taskCount, children }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const style = columnStyles[column.name] || {
    bg: "bg-gray-50",
    border: "border-gray-300",
    badgeVariant: "secondary",
  };

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        "p-4 min-h-[500px] transition-all duration-200",
        style.bg,
        isOver ? `${style.border} border-2 shadow-lg` : "border-transparent border-2 shadow-sm"
      )}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-foreground">{column.name}</h2>
        <Badge variant={style.badgeVariant}>{taskCount}</Badge>
      </div>

      {children}
    </Card>
  );
}
