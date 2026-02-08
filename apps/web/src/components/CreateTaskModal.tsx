import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

interface CreateTaskModalProps {
  columnId: string;
  columnName: string;
  onClose: () => void;
}

export function CreateTaskModal({
  columnId,
  columnName,
  onClose,
}: CreateTaskModalProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const createMutation = useMutation({
    mutationFn: () =>
      api.createTask(columnId, {
        title,
        description: description || undefined,
        priority,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board"] });
      onClose();
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      createMutation.mutate();
    }
  };

  const inputClass = "w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm";
  const labelClass = "block mb-2 text-sm font-semibold text-slate-700";

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-6 z-50 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-7 py-6 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/50">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Add Task to {columnName}
          </h2>
          <button
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer"
            onClick={onClose}
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-7">
            <div className="mb-6">
              <label htmlFor="taskTitle" className={labelClass}>
                Title
              </label>
              <input
                id="taskTitle"
                type="text"
                className={inputClass}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                required
                autoFocus
              />
            </div>
            <div className="mb-6">
              <label htmlFor="taskDescription" className={labelClass}>
                Description (optional)
              </label>
              <textarea
                id="taskDescription"
                className={`${inputClass} min-h-28 resize-y`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
              />
            </div>
            <div className="mb-6">
              <label htmlFor="taskPriority" className={labelClass}>
                Priority
              </label>
              <select
                id="taskPriority"
                className={`${inputClass} appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjOTQ5NDk0IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat`}
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as "low" | "medium" | "high")
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            {createMutation.error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 shadow-sm">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900">Failed to create task</p>
                  <p className="text-sm text-red-700 mt-0.5">
                    {createMutation.error instanceof Error
                      ? createMutation.error.message
                      : "An error occurred"}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 px-7 py-5 border-t border-slate-100 bg-slate-50/50">
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all cursor-pointer"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              disabled={createMutation.isPending || !title.trim()}
            >
              {createMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
                  Creating...
                </span>
              ) : (
                "Create Task"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
