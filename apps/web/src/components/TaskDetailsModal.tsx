import { useEffect, useState } from "react";
import { updateTask } from "../api/task.api";
import { getComments, addComment } from "../api/comment.api";

export function TaskDetailsModal({
  task,
  columns,
  onClose,
  refreshBoard,
}: any) {
  const [title, setTitle] = useState(task.title);
  const [columnId, setColumnId] = useState(task.column_id);
  const [comments, setComments] = useState<any[]>([]);
  const [comment, setComment] = useState("");

  async function loadComments() {
    const data = await getComments(task.id);
    setComments(data);
  }

  useEffect(() => {
    loadComments();
  }, []);

  async function saveTask() {
    await updateTask(task.id, {
      title,
      column_id: columnId,
    });

    refreshBoard();
    onClose();
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment) return;

    await addComment(task.id, comment);
    setComment("");
    loadComments();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[500px] p-5 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Task Details</h2>

        {/* EDIT TITLE */}
        <label className="text-sm">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded p-2 mt-1 mb-3"
        />

        {/* MOVE DROPDOWN */}
        <label className="text-sm">Move to column</label>
        <select
          value={columnId}
          onChange={(e) => setColumnId(Number(e.target.value))}
          className="w-full border rounded p-2 mt-1 mb-4"
        >
          {columns.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* COMMENTS */}
        <div className="mt-4">
          <h3 className="font-medium mb-2">Comments</h3>

          <div className="max-h-40 overflow-y-auto space-y-2">
            {comments.map((c) => (
              <div key={c.id} className="border p-2 rounded text-sm">
                {c.content}
              </div>
            ))}
          </div>

          <form onSubmit={submitComment} className="flex gap-2 mt-3">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add comment"
              className="flex-1 border rounded p-2"
            />
            <button className="bg-green-600 text-white px-3 rounded">
              Add
            </button>
          </form>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="border px-3 py-2 rounded">
            Cancel
          </button>
          <button
            onClick={saveTask}
            className="bg-blue-600 text-white px-3 py-2 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
