import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addComment, getComments } from "../utils/comments";
import ModalWrapper from "./ModalWrapper";
import { getErrorMessage } from "../lib/common";
import { Comment, Task } from "../types/types";

export default function TaskDetails({
  open,
  onClose,
  task,
}: {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}) {
  const qc = useQueryClient();
  const taskId = task?.id as string | undefined;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => getComments(taskId!),
    enabled: open && !!taskId,
  });

  const comments = useMemo(() => data?.data ?? [], [data]);

  const [body, setBody] = useState("");

  const create = useMutation({
    mutationFn: () => addComment(taskId!, body),
    onSuccess: async () => {
      setBody("");
      await qc.invalidateQueries({ queryKey: ["comments", taskId] });
    },
  });

  return (
    <ModalWrapper open={open} title="Task details" onClose={onClose}>
      {!task ? (
        <p className="text-sm text-gray-600">No task selected</p>
      ) : (
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold">{task.title}</h4>
            {task.description && (
              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Column: <span className="font-medium">{task.column?.name}</span>
            </p>
          </div>

          <div className="border-t pt-4">
            <h5 className="font-semibold mb-2">Comments</h5>

            {isLoading && <p className="text-sm">Loading comments...</p>}

            {isError && (
              <p className="text-sm text-red-600" role="alert">
                {getErrorMessage(error)}
              </p>
            )}

            {!isLoading && !isError && comments.length === 0 && (
              <p className="text-sm text-gray-500">No comments yet</p>
            )}

            <div className="space-y-2">
              {comments.map((c: Comment) => (
                <div
                  key={c.id}
                  className="rounded border bg-gray-50 p-3 text-sm"
                >
                  <p>{c.body}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {c.author?.name ?? "Unknown"} -{" "}
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <form
              className="mt-3 space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!body.trim()) return;
                create.mutate();
              }}
            >
              <label className="block">
                <span className="text-sm font-medium">Add comment</span>
                <textarea
                  className="mt-1 w-full rounded border px-3 py-2 min-h-20"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  aria-label="Add comment"
                  required
                />
              </label>

              {create.isError && (
                <p className="text-sm text-red-600" role="alert">
                  {getErrorMessage(create.error)}
                </p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-3 py-1 rounded-xl bg-blue-500 hover:bg-blue-700 text-white disabled:opacity-60"
                  disabled={create.isPending}
                >
                  {create.isPending ? "Posting..." : "Post comment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ModalWrapper>
  );
}
