import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ModalWrapper from "./ModalWrapper";
import { createTask } from "../utils/tasks";
import { Column } from "../types/types";
import { getErrorMessage } from "../lib/common";

export default function CreateTask({
  open,
  onClose,
  boardId,
  columns,
}: {
  open: boolean;
  onClose: () => void;
  boardId: string;
  columns: Column[];
}) {
  const qc = useQueryClient();

  const defaultColumnId = useMemo(() => columns?.[0]?.id ?? "", [columns]);

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [columnId, setColumnId] = useState<string>(defaultColumnId);

  const mutation = useMutation({
    mutationFn: (payload: {
      title: string;
      description: string | undefined;
      columnId: string;
    }) => createTask(boardId, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tasks", boardId] });
      setTitle("");
      setDescription("");
      setColumnId(defaultColumnId);
      onClose();
    },
  });

  if (open && !columnId && defaultColumnId) setColumnId(defaultColumnId);

  return (
    <ModalWrapper open={open} title="New task" onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate({
            title,
            description: description || undefined,
            columnId,
          });
        }}
      >
        <label className="block">
          <span className="text-sm font-medium">Title</span>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            aria-label="Title"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Description</span>
          <textarea
            className="mt-1 w-full rounded border px-3 py-2 min-h-22.5"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-label="Description"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Column</span>
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={columnId}
            disabled
            // onChange={(e) => setColumnId(e.target.value)}
            aria-label="Column"
            required
          >
            {columns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        {mutation.isError && (
          <p className="text-sm text-red-600" role="alert">
            {getErrorMessage(mutation.error)}
          </p>
        )}

        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            className="px-3 py-2 rounded border"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-3 py-2 rounded bg-black text-white disabled:opacity-60"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
