"use client";

import React from "react";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { getTask, createComment, updateTask } from "../lib/api";
import { Spinner } from "./Spinner";
import type { Task } from "./BoardView";

interface TaskDetailModalProps {
  task: Task;
  boardId: string;
  onClose: () => void;
  onRefresh: () => void;
}

export function TaskDetailModal({
  task,
  onClose,
  onRefresh,
}: TaskDetailModalProps) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [newCommentContent, setNewCommentContent] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(
    task.description || "",
  );

  const {
    data: taskData,
    isLoading,
    refetch: refetchTask,
  } = useQuery({
    queryKey: ["task", task.id],
    queryFn: async () => {
      if (!token) throw new Error("No token");
      const response = await getTask(task.id, token);
      return response.task;
    },
    enabled: !!token,
  });

  const currentTask = taskData || task;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!newCommentContent.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setIsAddingComment(true);
    try {
      await createComment(task.id, newCommentContent, token);
      setNewCommentContent("");
      await refetchTask();
      queryClient.invalidateQueries({ queryKey: ["board"] });
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      toast.success("Comment added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add comment");
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleSaveTitle = async () => {
    if (!token) return;

    if (!editedTitle.trim()) {
      toast.error("Task title cannot be empty");
      setEditedTitle(task.title);
      setIsEditingTitle(false);
      return;
    }

    if (editedTitle.trim() === task.title) {
      setEditedTitle(task.title);
      setIsEditingTitle(false);
      return;
    }

    try {
      await updateTask(task.id, { title: editedTitle }, token);
      setIsEditingTitle(false);
      await refetchTask();
      queryClient.invalidateQueries({ queryKey: ["board"] });
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      toast.success("Title updated");
      onRefresh();
    } catch (err) {
      setEditedTitle(task.title);
      setIsEditingTitle(false);
      toast.error(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  const handleSaveDescription = async () => {
    if (!token) return;

    // Only update if description actually changed
    if (editedDescription === (task.description || "")) {
      setIsEditingDescription(false);
      return;
    }

    try {
      await updateTask(task.id, { description: editedDescription }, token);
      setIsEditingDescription(false);
      await refetchTask();
      queryClient.invalidateQueries({ queryKey: ["board"] });
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      toast.success("Description updated");
      onRefresh();
    } catch (err) {
      setEditedDescription(task.description || "");
      setIsEditingDescription(false);
      toast.error(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-md w-[90%] max-w-1/3 max-h-[90vh] overflow-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-xs text-xl bg-transparent border-none cursor-pointer text-gray-600 hover:text-gray-900"
        >
          ✕
        </button>

        <div className="p-lg">
          {isEditingTitle ? (
            <input
              autoFocus
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveTitle();
                } else if (e.key === "Escape") {
                  setEditedTitle(currentTask.title);
                  setIsEditingTitle(false);
                }
              }}
              className="mb-md w-full px-sm py-xs bg-white text-black text-xl font-semibold border border-gray-300 rounded-md font-inherit"
            />
          ) : (
            <h2
              className="mb-md text-xl text-gray-900 font-semibold cursor-pointer"
              onDoubleClick={() => {
                setEditedTitle(currentTask.title);
                setIsEditingTitle(true);
              }}
              title="Double-click to edit"
            >
              {currentTask.title}
            </h2>
          )}

          <section className="mb-lg">
            <h3 className="mb-xs text-sm font-semibold text-gray-900">
              Description
            </h3>
            {isEditingDescription ? (
              <textarea
                autoFocus
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                onBlur={handleSaveDescription}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setEditedDescription(currentTask.description || "");
                    setIsEditingDescription(false);
                  }
                }}
                className="w-full px-sm py-xs text-sm border border-gray-300 rounded-md font-inherit min-h-20 bg-white text-gray-900"
              />
            ) : (
              <p
                className="m-0 text-sm text-gray-600 leading-relaxed cursor-pointer bg-gray-50 p-xs rounded-md"
                onClick={() => {
                  setEditedDescription(currentTask.description || "");
                  setIsEditingDescription(true);
                }}
                title="Click to edit"
              >
                {currentTask.description || "(No description)"}
              </p>
            )}
          </section>

          <section className="mb-lg">
            <h3 className="mb-xs text-sm font-semibold text-gray-900">
              Comments ({currentTask.comments?.length})
            </h3>

            {isLoading ? (
              <div className="min-h-25">
                <Spinner />
              </div>
            ) : (
              <div className="mb-sm">
                {currentTask.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-xs bg-gray-50 rounded-md mb-xs"
                  >
                    <strong className="text-xs text-gray-900">
                      {comment.user.name}
                    </strong>
                    <p className="m-0 mt-xs text-xs text-gray-900 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddComment} className="flex flex-col gap-xs">
              <textarea
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                placeholder="Add a comment..."
                disabled={isAddingComment}
                className="px-sm py-xs text-xs border bg-amber-50 text-gray-900 border-gray-300 rounded-md font-inherit min-h-15"
              />
              <button
                type="submit"
                disabled={isAddingComment || !newCommentContent.trim()}
                className={`px-sm py-xs text-xs font-semibold text-white bg-blue-600 border-none rounded ${
                  isAddingComment || !newCommentContent.trim()
                    ? "opacity-60 cursor-not-allowed"
                    : "opacity-100 cursor-pointer hover:bg-blue-700"
                }`}
              >
                {isAddingComment ? "Adding..." : "Add comment"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
