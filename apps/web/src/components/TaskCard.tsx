import { useState } from "react";
import { deleteTask } from "../api/task.api";
import { TaskDetailsModal } from "./TaskDetailsModal";

type Props = {
  task: any;
  columns: any[];
  refreshBoard: () => void;
};

export default function TaskCard({ task, columns, refreshBoard }: Props) {
  const [open, setOpen] = useState(false);

  const removeTask = async () => {
    await deleteTask(task.id);
    refreshBoard();
  };

  return (
    <>
      <div
        tabIndex={0}
        role="button"
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") setOpen(true);
        }}
        className="bg-white p-3 rounded shadow cursor-pointer focus:outline-blue-500"
      >
        <p className="font-medium">{task.title}</p>

        <button
          aria-label="Delete task"
          onClick={(e) => {
            e.stopPropagation();
            removeTask();
          }}
          className="text-red-600 text-sm mt-2"
        >
          Delete
        </button>
      </div>

      {open && (
        <TaskDetailsModal
          task={task}
          columns={columns}
          onClose={() => setOpen(false)}
          refreshBoard={refreshBoard}
        />
      )}
    </>
  );
}
