import React from "react";
import { Task } from "../../../core/api";

export const TaskCard = ({
  task,
  onClick,
}: {
  task: Task;
  onClick: () => void;
}) => {
  const isDone = task.status === "done";

  return (
    <div
      onClick={onClick}
      className={`border-strict p-5 bg-white group hover:bg-black transition-colors duration-75 cursor-pointer ${isDone ? "opacity-40 hover:opacity-100" : ""}`}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-bold border-strict px-1.5 py-0.5 group-hover:border-white group-hover:text-white uppercase transition-colors">
          {task.status.replace("-", " ")}
        </span>
        <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors">
          {isDone ? "done_all" : "north_east"}
        </span>
      </div>
      <h4
        className={`text-sm font-bold leading-tight mb-2 group-hover:text-white transition-colors ${isDone ? "line-through" : ""}`}
      >
        {task.title}
      </h4>
      <p className="text-xs text-primary/60 group-hover:text-white/60 mb-6 font-light transition-colors line-clamp-2">
        {task.description || "No description provided."}
      </p>
      <div className="flex items-center justify-between pt-4 border-t border-primary/10 group-hover:border-white/20 transition-colors">
        <span className="text-[10px] font-mono group-hover:text-white">
          TSK-{task.id.toString().padStart(2, "0")}
        </span>
        <div className="flex items-center gap-2">
          {isDone ? (
            <span className="text-[10px] group-hover:text-white uppercase">
              {new Date(task.createdAt).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
              })}
            </span>
          ) : (
            <span className="material-symbols-outlined text-sm group-hover:text-white">
              face
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
