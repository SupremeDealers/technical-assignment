import React, { useEffect, useState } from "react";
import { getTasksByColumn, createTask } from "../api/task.api";
import TaskCard from "./TaskCard";

export default function Column({
  column,
  columns,
  refreshBoard,
  refreshKey,
}: {
  column: any;
  columns: any[];
  refreshBoard: () => void;
  refreshKey: number;
}) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");

  function fetchTasks() {
    getTasksByColumn(column.id)
      .then(setTasks)
      .catch(() => setTasks([]));
  }

  useEffect(() => {
    fetchTasks();
  }, [column.id, refreshKey]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;

    await createTask(column.id, { title });

    setTitle("");
    setShowForm(false);
    refreshBoard();
  }

  return (
    <div className="w-full p-3 rounded-md bg-gray-100">
      <h4 className="font-semibold">
        {column.name} ({tasks.length})
      </h4>

      <div className="flex flex-col gap-2 mt-3">
        {tasks.map((t) => (
          <TaskCard
            key={t.id}
            task={t}
            columns={columns}
            refreshBoard={refreshBoard}
          />
        ))}
      </div>

      {showForm ? (
        <form onSubmit={submit} className="mt-3">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            aria-label="Task title"
            className="w-full border-2 rounded-md py-2 px-3 mt-2"
          />

          <div className="flex justify-between mt-3">
            <button className="px-3 py-2 bg-blue-600 text-white rounded-md">
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-2 border rounded-md"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="p-2 mt-3 text-white bg-green-600 rounded-md"
        >
          + Add task
        </button>
      )}
    </div>
  );
}
