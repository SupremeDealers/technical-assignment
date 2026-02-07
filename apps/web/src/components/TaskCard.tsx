import { Trash2, GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Column, Task } from "../types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { getColumnIcon, getColumnIconColor } from "../lib/column-icons";

type Props = {
  task: Task;
  columns: Column[];
  onMove: (taskId: string, columnId: string) => void;
  onSelect: (task: Task) => void;
  onDelete: (taskId: string) => void;
};

const priorityLabels: Record<number, string> = {
  1: "Low",
  2: "Medium-Low",
  3: "Medium",
  4: "High",
  5: "Critical",
};

const priorityColors: Record<number, string> = {
  1: "bg-[hsl(var(--priority-1))] text-white border-transparent",
  2: "bg-[hsl(var(--priority-2))] text-white border-transparent",
  3: "bg-[hsl(var(--priority-3))] text-white border-transparent",
  4: "bg-[hsl(var(--priority-4))] text-white border-transparent",
  5: "bg-[hsl(var(--priority-5))] text-white border-transparent",
};

export function TaskCard({ task, columns, onMove, onSelect, onDelete }: Props) {
  const priority = task.priority ?? 1;
  const priorityLabel = priorityLabels[priority] ?? "Low";
  const priorityColorClass = priorityColors[priority] || priorityColors[1];

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: {
      task,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card group ${isDragging ? 'opacity-50' : ''} cursor-pointer`}
      onClick={() => onSelect(task)}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
            {task.title}
          </h4>

          {task.description ? (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          ) : null}

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {priority > 0 ? (
              <Badge variant="outline" className={`text-xs px-1.5 py-0 font-semibold ${priorityColorClass}`}>
                {priorityLabel}
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent cursor-grab active:cursor-grabbing transition-colors rounded"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <Select value={task.columnId} onValueChange={(val) => onMove(task.id, val)}>
          <SelectTrigger className="h-7 text-xs flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {columns.map((col) => {
              const ColumnIcon = getColumnIcon(col.title);
              const iconColor = getColumnIconColor(col.title);
              return (
                <SelectItem key={col.id} value={col.id} className="text-xs">
                  <div className="flex items-center gap-2">
                    <ColumnIcon className={`h-3.5 w-3.5 ${iconColor}`} />
                    {col.title}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="sr-only">Delete task</span>
        </Button>
      </div>
    </div>
  );
}
