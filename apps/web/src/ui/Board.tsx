import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBoards } from "../utils/boards";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getTasks, moveTask } from "../utils/tasks";
import { useState } from "react";
import CreateTask from "../components/CreateTask";
import { Columns } from "../types/types";
export default function Board() {
  const nav = useNavigate();
  const qc = useQueryClient();

  const [openCreate, setOpenCreate] = useState(false);

  const { data: boardsData, isLoading: boardLoading } = useQuery({
    queryKey: ["boards"],
    queryFn: getBoards,
  });

  const { data, isLoading, isError } = useAuth();

  if (!localStorage.getItem("token")) {
    nav("/login");
    return null;
  }

  const boardId = boardsData?.[0]?.id;

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", boardId],
    queryFn: () => getTasks(boardId),
    enabled: !!boardId,
  });

  const move = useMutation({
    mutationFn: ({ id, columnId }: any) => moveTask(id, columnId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", boardId] }),
  });

  if (isLoading || boardLoading || tasksLoading)
    return <p>Loading boards...</p>;

  if (!boardId) return <p>No boards yet</p>;

  const columns: Columns[] = Array.from(
    new Map(tasks.map((t: any) => [t.column.id, t.column])).values(),
  ) as Columns[];
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-6">{boardsData[0].name}</h1>
        <button
          className="px-3 py-2 rounded-2xl bg-black text-white"
          onClick={() => setOpenCreate(true)}
        >
          New task
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col: any) => (
          <div
            key={col.id}
            className="bg-white rounded-xl shadow-sm border p-4"
          >
            <h2 className="font-semibold mb-4 text-gray-700">{col.name}</h2>

            <div className="space-y-3">
              {tasks
                .filter((t: any) => t.columnId === col.id)
                .map((task: any) => (
                  <div
                    key={task.id}
                    className="bg-gray-50 border rounded-lg p-3"
                  >
                    <p className="font-medium text-sm">{task.title}</p>

                    {task.description && (
                      <p className="text-xs text-gray-500 mt-1">
                        {task.description}
                      </p>
                    )}

                    <select
                      className="mt-2 w-full text-sm border rounded px-2 py-1"
                      value={task.columnId}
                      aria-label="Move task"
                      onChange={(e) =>
                        move.mutate({
                          id: task.id,
                          columnId: e.target.value,
                        })
                      }
                    >
                      {columns.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}

              {tasks.filter((t: any) => t.columnId === col.id).length === 0 && (
                <p className="text-xs text-gray-400">No tasks</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <CreateTask
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        boardId={boardId}
        columns={columns}
      />
    </div>
  );
}
