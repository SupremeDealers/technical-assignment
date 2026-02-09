import React from "react";
import { Task } from "../../../core/api";
import { TaskCard } from "./TaskCard";

export const Column = ({
  title,
  status,
  tasks,
  onAddTask,
  onTaskClick,
}: {
  title: string;
  status: string;
  tasks: Task[];
  onAddTask: (status: string) => void;
  onTaskClick: (task: Task) => void;
}) => {
  const iconMap: Record<string, string> = {
    todo: "more_horiz",
    "in-progress": "play_arrow",
    done: "check_circle",
  };

  return (
    <div className="flex flex-col min-h-[70vh]">
      <div className="border-b border-primary pb-3 mb-6 flex justify-between items-center">
        <h3 className="text-xs font-bold tracking-[0.2em] uppercase">
          {title} ({tasks.length})
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddTask(status)}
            className="hover-invert p-1 transition-colors duration-100 flex items-center justify-center"
          >
            <span className="material-symbols-outlined !text-sm">add</span>
          </button>
          <span className="material-symbols-outlined text-sm">
            {iconMap[status] || "more_horiz"}
          </span>
        </div>
      </div>
      <div className="space-y-4 flex-1">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
          />
        ))}
        {tasks.length === 0 && (
          <div className="border-strict border-dashed p-8 text-center opacity-20 flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-2xl">
              grid_view
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase">
              No tasks in {title}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
