import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task, Comment, apiFetch } from "../../../core/api";

export const TaskModal = ({
  task,
  isOpen,
  onClose,
}: {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStatus, setEditStatus] = useState<Task["status"]>("todo");

  useEffect(() => {
    if (task) {
      setEditTitle(task.title);
      setEditDesc(task.description);
      setEditStatus(task.status);
    }
  }, [task]);

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", task?.id],
    queryFn: () => apiFetch(`/tasks/${task?.id}/comments`),
    enabled: !!task,
  });

  const addComment = useMutation({
    mutationFn: (text: string) =>
      apiFetch(`/tasks/${task?.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ text }),
      }),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["comments", task?.id] });
    },
  });

  const updateTask = useMutation({
    mutationFn: (updates: Partial<Task>) =>
      apiFetch(`/tasks/${task?.id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setIsEditing(false);
      onClose();
    },
  });

  const deleteTask = useMutation({
    mutationFn: () => apiFetch(`/tasks/${task?.id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      onClose();
    },
  });

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
      <div className="bg-white border-strict w-full max-w-2xl max-h-[90vh] flex flex-col relative">
        {/* Header */}
        <div className="p-8 border-b border-primary flex justify-between items-start">
          <div className="flex-1">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-2 opacity-40">
              Task Details / TSK-{task.id}
            </p>
            {isEditing ? (
              <input
                className="text-3xl font-light tracking-tight w-full bg-transparent border-b border-primary/20 focus:border-primary outline-none pb-1"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                autoFocus
              />
            ) : (
              <h2 className="text-3xl font-light tracking-tight">
                {task.title}
              </h2>
            )}
            <div className="flex items-center gap-4 mt-4 text-[10px] font-bold tracking-widest uppercase">
              <span className="border-strict px-2 py-1">
                {task.status.replace("-", " ")}
              </span>
              <span className="opacity-40">
                Created: {new Date(task.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover-invert transition-colors p-1 flex items-center justify-center -mt-2 -mr-2"
          >
            <span className="material-symbols-outlined font-light !text-3xl">
              close
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-12">
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold tracking-[0.2em] uppercase">
                    Specification
                  </h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-[10px] font-bold uppercase tracking-widest border-b border-primary hover:opacity-50 transition-opacity"
                    >
                      Edit Content
                    </button>
                  )}
                </div>
                {isEditing ? (
                  <textarea
                    className="w-full border-strict p-4 min-h-[150px] text-sm font-light leading-relaxed outline-none focus:bg-gray-50 transition-colors"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                  />
                ) : (
                  <p className="text-sm font-light leading-relaxed whitespace-pre-wrap">
                    {task.description ||
                      "No specification provided for this task element."}
                  </p>
                )}
              </section>

              <section>
                <h3 className="text-xs font-bold tracking-[0.2em] uppercase mb-6">
                  Workflow Communication
                </h3>
                <div className="space-y-6">
                  <div className="border-strict p-2 flex gap-4">
                    <input
                      className="flex-1 bg-transparent px-2 text-sm font-light outline-none"
                      placeholder="ADD PROTOCOL UPDATE..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && commentText.trim())
                          addComment.mutate(commentText);
                      }}
                    />
                    <button
                      onClick={() => addComment.mutate(commentText)}
                      disabled={!commentText.trim()}
                      className={`border-strict px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors ${
                        commentText.trim()
                          ? "hover-invert"
                          : "opacity-20 cursor-not-allowed"
                      }`}
                    >
                      Transmit
                    </button>
                  </div>

                  <div className="space-y-6 mt-8">
                    {commentsLoading ? (
                      <div className="animate-pulse flex items-center gap-2 opacity-20">
                        <span className="material-symbols-outlined text-sm">
                          sync
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          Retrieving data...
                        </span>
                      </div>
                    ) : (
                      comments?.comments.map((c: Comment) => (
                        <div
                          key={c.id}
                          className="border-l border-primary/20 pl-6 relative"
                        >
                          <div className="absolute left-[-4.5px] top-0 w-2 h-2 bg-primary"></div>
                          <div className="flex justify-between items-baseline mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest underline">
                              {c.username}
                            </span>
                            <span className="text-[9px] font-mono opacity-40">
                              {new Date(c.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-xs font-light leading-relaxed">
                            {c.text}
                          </p>
                        </div>
                      ))
                    )}
                    {!commentsLoading && comments?.comments.length === 0 && (
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-20 text-center py-4">
                        --- No Communication Logs ---
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar Controls */}
            <div className="space-y-8 border-l border-primary/10 pl-8 hidden md:block">
              {isEditing && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase">
                    Control Matrix
                  </h3>
                  <div>
                    <label className="text-[9px] font-bold uppercase mb-2 block opacity-40">
                      Status Vector
                    </label>
                    <select
                      className="w-full border-strict p-2 text-[10px] font-bold uppercase outline-none"
                      value={editStatus}
                      onChange={(e) =>
                        setEditStatus(e.target.value as Task["status"])
                      }
                    >
                      <option value="todo">Todo / Backlog</option>
                      <option value="in-progress">In Progress / Active</option>
                      <option value="done">Done / Archive</option>
                    </select>
                  </div>
                  <div className="pt-4 space-y-3">
                    <button
                      onClick={() =>
                        updateTask.mutate({
                          title: editTitle,
                          description: editDesc,
                          status: editStatus,
                        })
                      }
                      className="w-full border-strict bg-black text-white py-3 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-colors"
                    >
                      Execute Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="w-full border-strict py-3 text-[10px] font-bold tracking-[0.2em] uppercase hover-invert transition-colors"
                    >
                      Abort
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase">
                  Dangerous Operations
                </h3>
                <button
                  onClick={() => {
                    if (confirm("REVEAL: ACTION IRREVERSIBLE. PURGE TASK?"))
                      deleteTask.mutate();
                  }}
                  className="w-full border-strict border-red-500 text-red-500 py-3 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-red-500 hover:text-white transition-colors"
                >
                  Purge Entity
                </button>
              </div>

              <div className="pt-8 opacity-20 group">
                <div className="border-strict p-4 aspect-square flex flex-col items-center justify-center gap-2 grayscale group-hover:grayscale-0 transition-all">
                  <span className="material-symbols-outlined text-3xl">
                    qr_code_2
                  </span>
                  <span className="text-[8px] font-mono">SYS-ID-{task.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
