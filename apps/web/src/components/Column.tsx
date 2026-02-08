import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskCard } from "./TaskCard";
import type { Column as ColumnType, Task } from "../types";

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
}

export function Column({ column, tasks, onTaskClick, onAddTask }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  });

  return (
    <div
      className={`shrink-0 w-72 rounded-xl flex flex-col max-h-full transition-all ${
        isOver
          ? "bg-indigo-50 border-2 border-indigo-400"
          : "bg-slate-100 border border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
          {column.name}
        </span>
        <span className="bg-white text-slate-600 px-2 py-0.5 rounded-full text-xs font-semibold">
          {tasks.length}
        </span>
      </div>
      <div ref={setNodeRef} className="flex-1 px-3 py-2 overflow-y-auto flex flex-col gap-2.5">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="text-center py-6 text-xs text-slate-400">
            No tasks
          </div>
        )}
      </div>
      <div className="px-3 py-2 border-t border-slate-200">
        <button
          className="w-full py-2 rounded-lg text-sm font-medium text-indigo-600 hover:bg-white hover:text-indigo-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          onClick={onAddTask}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </button>
      </div>
    </div>
  );
}
