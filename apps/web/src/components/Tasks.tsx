import { RiDeleteBinLine, RiPencilFill } from "@remixicon/react";
import { Column, Task } from "../types/types";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTask } from "../utils/tasks";

interface TaskProps {
  task: Task;
  columns: Column[];
  delTask: any;
  move: any;
  setSelectedTask: (task: Task) => void;
  setOpenTask: (open: boolean) => void;
  boardId: string;
}
export default function Tasks({
  task,
  columns,
  delTask,
  move,
  setSelectedTask,
  setOpenTask,
  boardId,
}: TaskProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");

  const qc = useQueryClient();

  const update = useMutation({
    mutationFn: (payload: {
      id: string;
      title: string;
      description?: string;
    }) =>
      updateTask(payload.id, {
        title: payload.title,
        description: payload.description,
      }),
    onSuccess: () => {
      setIsEditing(false);
      qc.invalidateQueries({ queryKey: ["tasks", boardId] });
    },
  });

  return (
    <button
      key={task.id}
      onClick={() => {
        if (isEditing) return;
        setSelectedTask(task);
        setOpenTask(true);
      }}
      className="w-full text-left bg-gray-50 border rounded-lg p-3 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
    >
      <div className="w-full flex items-start justify-between gap-3">
        {isEditing ? (
          <div
            className="flex-1 space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <label className="block">
              <span className="sr-only">Title</span>
              <input
                className="w-full rounded border px-2 py-1 text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </label>

            <label className="block">
              <span className="sr-only">Description</span>
              <textarea
                className="w-full rounded border px-2 py-1 text-xs min-h-16"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description"
              />
            </label>
          </div>
        ) : (
          <div className="flex-1">
            <p className="font-medium text-sm">{task.title}</p>
            {task.description && (
              <p className="text-xs text-gray-500 mt-1">{task.description}</p>
            )}
          </div>
        )}

        <div className="inline-flex items-center gap-2">
          {!isEditing ? (
            <>
              <button
                className="text-blue-500 hover:text-blue-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                aria-label="Edit task"
                type="button"
              >
                <RiPencilFill size={16} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  delTask.mutate({ id: task.id });
                }}
                className="text-red-400 hover:text-red-700"
                aria-label="Delete task"
                type="button"
              >
                <RiDeleteBinLine size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="text-gray-600 hover:text-gray-900 text-xs px-2 py-1 border rounded-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(false);
                  setTitle(task.title);
                  setDescription(task.description ?? "");
                }}
                disabled={update.isPending}
              >
                Cancel
              </button>

              <button
                type="button"
                className="text-white bg-blue-500 hover:bg-blue-500/80 text-xs px-2 py-1 rounded-lg disabled:opacity-60"
                onClick={(e) => {
                  e.stopPropagation();

                  const isTitle = title.trim();
                  if (!isTitle) return;

                  update.mutate({
                    id: task.id,
                    title,
                    description: description.trim() || undefined,
                  });
                }}
                disabled={update.isPending}
              >
                {update.isPending ? "Saving..." : "Save"}
              </button>
            </>
          )}
        </div>
      </div>

      <select
        className="mt-2 w-full text-sm border rounded px-2 py-1 disabled:opacity-60"
        value={task.columnId}
        disabled={isEditing}
        aria-label="Move task"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) =>
          move.mutate({
            id: task.id,
            columnId: e.target.value,
          })
        }
      >
        {columns.map((c: Column) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </button>
  );
}
