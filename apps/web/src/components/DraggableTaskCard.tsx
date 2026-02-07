import { useDraggable } from "@dnd-kit/core";
import { type Task } from "../lib/api";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { GripVertical, User } from "lucide-react";
import { cn } from "../lib/utils";

interface DraggableTaskCardProps {
  task: Task;
  onSelect: () => void;
  onEdit: () => void;
}

const priorityVariants = {
  low: "success",
  medium: "warning",
  high: "destructive",
} as const;

export function DraggableTaskCard({ task, onSelect, onEdit }: DraggableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-3 cursor-pointer transition-all duration-200 hover:shadow-md flex items-start justify-between group",
        isDragging && "cursor-grabbing opacity-50"
      )}
    >
      <div className="flex-1 min-w-0" onClick={onSelect}>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-semibold text-foreground truncate flex-1">
            {task.title}
          </h3>
          <Badge variant={priorityVariants[task.priority]} className="text-xs uppercase shrink-0">
            {task.priority}
          </Badge>
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          <span>{task.createdBy.name}</span>
        </div>
      </div>

      <div
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing p-1 ml-2 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-5 w-5" />
      </div>
    </Card>
  );
}
