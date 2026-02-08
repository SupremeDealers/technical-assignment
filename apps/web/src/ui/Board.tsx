import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBoards } from "../utils/boards";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { deleteTask, getTasks, moveTask } from "../utils/tasks";
import { useEffect, useState } from "react";
import CreateTask from "../components/CreateTask";
import { Column, Task } from "../types/types";
import { getColumns } from "../utils/columns";
import TaskDetails from "../components/TaskDetails";
import { getErrorMessage } from "../lib/common";
import Pagination from "../components/Pagination";
import EmptySearch from "../components/EmptySearch";
import ErrorDisplay from "../components/ErrorDisplay";
import { RiDeleteBinLine } from "@remixicon/react";
import Tasks from "../components/Tasks";
export default function Board() {
  const nav = useNavigate();
  const qc = useQueryClient();

  const [openCreate, setOpenCreate] = useState(false);
  const [openTask, setOpenTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 5;
  const [debouncedVal, setDebouncedVal] = useState("");

  const { data: boardsData, isLoading: boardLoading } = useQuery({
    queryKey: ["boards"],
    queryFn: getBoards,
  });

  const { data: columns, isLoading: columnsLoading } = useQuery({
    queryKey: ["columns"],
    queryFn: getColumns,
  });

  const { data: profile, isLoading } = useAuth();

  if (!localStorage.getItem("token")) {
    nav("/login");
    return null;
  }

  const boardId = boardsData?.[0]?.id;

  const delayMs = 1000;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedVal(search), delayMs);
    return () => window.clearTimeout(timer);
  }, [search, delayMs]);

  useEffect(() => {
    setPage(1);
  }, [debouncedVal]);

  const {
    data,
    isLoading: tasksLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["tasks", boardId, page, limit, debouncedVal],
    queryFn: () =>
      getTasks(boardId || "", page, limit, debouncedVal || undefined),
    enabled: !!boardId,
    placeholderData: (previousData) => previousData,
  });

  const delTask = useMutation({
    mutationFn: ({ id }: { id: string }) => deleteTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", boardId] }),
  });

  const move = useMutation({
    mutationFn: ({ id, columnId }: { id: string; columnId: string }) =>
      moveTask(id, columnId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", boardId] }),
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    nav("/login");
  };

  if (!boardId) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-xl rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">No board found</h2>
        </div>
      </div>
    );
  }

  if (isLoading || boardLoading || columnsLoading || tasksLoading) {
    return <p>Loading boards...</p>;
  }

  if (isError) {
    const msg = getErrorMessage(error);

    return <ErrorDisplay msg={msg} qc={qc} boardId={boardId} />;
  }

  const meta = data?.meta ?? { page: 1, limit, total: 0, hasNext: false };

  if (data?.tasks.length === 0) {
    return (
      <EmptySearch
        debouncedVal={debouncedVal}
        setOpenCreate={setOpenCreate}
        setSearch={setSearch}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div onClick={handleLogout} className="w-full flex justify-end">
        <button className="px-3 py-1 bg-red-500 text-white rounded-xl hover:bg-red-700">
          Logout
        </button>
      </div>
      <h1 className="text-2xl text-center font-semibold">
        Welcome {profile.name}
      </h1>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-6">{boardsData[0].name}</h1>
        <p className="text-sm text-gray-500">
          {meta.total} task{meta.total === 1 ? "" : "s"}
        </p>

        <div className="flex gap-2 w-full sm:w-auto">
          <input
            className="w-full sm:w-72 rounded-xl border px-3 py-2 text-sm"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search tasks"
          />

          <button
            className="px-3 py-1 text-xs sm:text-sm rounded-xl bg-blue-500 text-white hover:bg-blue-700"
            onClick={() => setOpenCreate(true)}
          >
            New task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col: Column) => (
          <div
            key={col.id}
            className="bg-white rounded-xl shadow-sm border p-4"
          >
            <h2 className="font-semibold mb-4 text-gray-700">{col.name}</h2>

            <div className="space-y-3">
              {data?.tasks
                ?.filter((t: Task) => t.columnId === col.id)
                .map((task: Task) => (
                  <Tasks
                    task={task}
                    columns={columns}
                    setSelectedTask={setSelectedTask}
                    delTask={delTask}
                    move={move}
                    setOpenTask={setOpenTask}
                    boardId={boardId}
                  />
                ))}

              {data?.tasks?.filter((t: Task) => t.columnId === col.id)
                .length === 0 && (
                <p className="text-xs text-gray-400">No tasks</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <Pagination meta={meta} setPage={setPage} />

      <CreateTask
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        boardId={boardId}
        columns={columns}
      />

      <TaskDetails
        open={openTask}
        onClose={() => setOpenTask(false)}
        task={selectedTask}
      />
    </div>
  );
}
