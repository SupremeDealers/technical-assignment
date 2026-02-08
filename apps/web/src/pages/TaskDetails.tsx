import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createComment, getComments } from "../api/comments";
import { useBoard, useDeleteTask, useTask, useUpdateTask } from "../hooks/useTasks";

export const TaskDetails = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { taskId } = useParams<{ taskId: string }>();

  const taskIdNum = Number(taskId);
  const isValidTaskId = typeof taskId === "string" && !Number.isNaN(taskIdNum);

  const { data: board } = useBoard();
  const { data: task, isLoading: taskLoading, isError: taskIsError } = useTask(
    isValidTaskId ? taskIdNum : null,
  );

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<"LOW" | "MEDIUM" | "HIGH">(
    "MEDIUM",
  );
  const [columnId, setColumnId] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!task) return;
    setTitle(task.title ?? "");
    setDescription(task.description ?? "");
    setPriority(task.priority);
    setColumnId(task.columnId);
  }, [task]);

  const hasChanges =
    !!task &&
    (title.trim() !== task.title ||
      description.trim() !== (task.description ?? "") ||
      priority !== task.priority);

  const { data: comments, isLoading: commentsLoading, isError: commentsIsError } = useQuery({
    queryKey: ["comments", taskIdNum],
    queryFn: () => getComments(taskIdNum),
    enabled: isValidTaskId,
  });

  const [newComment, setNewComment] = React.useState("");

  const commentMutation = useMutation({
    mutationFn: (content: string) => createComment(taskIdNum, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", taskIdNum] });
      setNewComment("");
    },
  });

  const onClose = () => navigate(-1);

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    updateTask.mutate({
      taskId: task.id,
      data: {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
      },
    });
  };

  const onMoveColumn = (next: number) => {
    if (!task) return;
    setColumnId(next);
    updateTask.mutate({ taskId: task.id, data: { columnId: next } });
  };

  const onDelete = () => {
    if (!task) return;
    deleteTask.mutate(task.id, { onSuccess: () => onClose() });
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    const content = newComment.trim();
    if (!content) return;
    commentMutation.mutate(content);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold truncate">
              {task ? task.title : "Task"}
            </h2>
            {task ? (
              <p className="text-sm text-gray-500 mt-1">
                #{task.id} • {task.priority}
              </p>
            ) : null}
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {!isValidTaskId ? (
            <div className="text-sm text-red-600">Invalid task id.</div>
          ) : taskLoading ? (
            <div className="text-sm text-gray-600">Loading task...</div>
          ) : taskIsError || !task ? (
            <div className="text-sm text-red-600">Task not found.</div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              <form onSubmit={onSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) =>
                        setPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH")
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Column
                    </label>
                    <select
                      value={columnId ?? task.columnId}
                      onChange={(e) => onMoveColumn(Number(e.target.value))}
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                      disabled={!board}
                    >
                      {(board?.columns ?? []).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={deleteTask.isPending}
                    className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700 disabled:opacity-50"
                  >
                    {deleteTask.isPending ? "Deleting..." : "Delete"}
                  </button>

                  <button
                    type="submit"
                    disabled={!hasChanges || updateTask.isPending}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                  >
                    {updateTask.isPending ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-2">Comments</h3>

                <div className="space-y-4 mb-4">
                  {commentsLoading ? (
                    <p>Loading comments...</p>
                  ) : commentsIsError ? (
                    <p className="text-sm text-red-600">Failed to load comments.</p>
                  ) : comments?.length === 0 ? (
                    <p className="text-gray-500 italic">No comments yet.</p>
                  ) : (
                    comments?.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                          <span className="font-medium text-gray-900">
                            {comment.user_email}
                          </span>
                          <span>
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-800">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSubmitComment} className="mt-4">
                  <textarea
                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={3}
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={commentMutation.isPending || !newComment.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {commentMutation.isPending ? "Posting..." : "Post Comment"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
