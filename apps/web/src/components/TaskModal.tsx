import { useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Task, Column } from "../types";

interface TaskModalProps {
  task: Task | null;
  columns: Column[];
  onClose: () => void;
}

const priorityStyles: Record<string, string> = {
  high: "bg-red-50 text-red-600 border border-red-200 shadow-sm",
  medium: "bg-amber-50 text-amber-700 border border-amber-200 shadow-sm",
  low: "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm",
};

export function TaskModal({ task, columns, onClose }: TaskModalProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState(task?.priority || "medium");
  const [columnId, setColumnId] = useState(task?.columnId || "");
  const [newComment, setNewComment] = useState("");

  const { data: commentsData, isLoading: loadingComments } = useQuery({
    queryKey: ["comments", task?.id],
    queryFn: () => api.getComments(task!.id),
    enabled: !!task,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof api.updateTask>[1]) =>
      api.updateTask(task!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board"] });
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteTask(task!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board"] });
      onClose();
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => api.createComment(task!.id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", task?.id] });
      setNewComment("");
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      title,
      description: description || undefined,
      priority,
      columnId: columnId !== task?.columnId ? columnId : undefined,
    });
  };

  const handleAddComment = (e: FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      commentMutation.mutate(newComment.trim());
    }
  };

  if (!task) return null;

  const inputClass = "w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm";
  const labelClass = "block mb-2 text-sm font-semibold text-slate-700";

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-6 z-50 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-7 py-6 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/50">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            {isEditing ? "Edit Task" : "Task Details"}
          </h2>
          <button
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer"
            onClick={onClose}
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="p-7">
          {isEditing ? (
            <>
              <div className="mb-6">
                <label className={labelClass}>Title</label>
                <input
                  type="text"
                  className={inputClass}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="mb-6">
                <label className={labelClass}>Description</label>
                <textarea
                  className={`${inputClass} min-h-28 resize-y`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={labelClass}>Priority</label>
                  <select
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
                <div>
                  <label className={labelClass}>Column</label>
                  <select
                    className={`${inputClass} appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjOTQ5NDk0IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat`}
                    value={columnId}
                    onChange={(e) => setColumnId(e.target.value)}
                  >
                    {columns.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-7">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Title
                </div>
                <div className="text-xl font-bold text-slate-900">
                  {task.title}
                </div>
              </div>
              {task.description && (
                <div className="mb-7">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Description
                  </div>
                  <div className="text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {task.description}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-6 mb-7">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Priority
                  </div>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${priorityStyles[task.priority]}`}>
                    {task.priority}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Column
                  </div>
                  <div className="text-slate-900 font-medium">
                    {columns.find((c) => c.id === task.columnId)?.name}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="mb-4 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <div className="text-sm font-bold text-slate-900">
                Comments ({commentsData?.comments.length || 0})
              </div>
            </div>
            {loadingComments ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-solid border-indigo-600 border-r-transparent mb-3"></div>
                <p className="text-xs text-slate-500">Loading comments...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {commentsData?.comments.map((comment) => (
                  <div key={comment.id} className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-xs font-bold">
                          {comment.author.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-sm text-slate-900">
                          {comment.author.name}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm text-slate-700 leading-relaxed pl-9">
                      {comment.content}
                    </div>
                  </div>
                ))}
                {commentsData?.comments.length === 0 && (
                  <div className="py-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 mb-3">
                      <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-600">No comments yet</p>
                    <p className="text-xs text-slate-500 mt-1">Be the first to add a comment</p>
                  </div>
                )}
              </div>
            )}
            <form className="mt-4" onSubmit={handleAddComment}>
              <div className="mb-3">
                <textarea
                  className={`${inputClass} min-h-20`}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={2}
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-md shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                disabled={!newComment.trim() || commentMutation.isPending}
              >
                {commentMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
                    Adding...
                  </span>
                ) : (
                  "Add Comment"
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-7 py-5 border-t border-slate-100 bg-slate-50/50">
          {isEditing ? (
            <>
              <button
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all cursor-pointer"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-md shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                onClick={handleSave}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </>
          ) : (
            <>
              <button
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this task?")) {
                    deleteMutation.mutate();
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
              <button
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
              <button
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
                onClick={onClose}
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
