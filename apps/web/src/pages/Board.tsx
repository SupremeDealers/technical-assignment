import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { arrayMove } from "@dnd-kit/sortable";
import * as tasksApi from "../api/tasks";
import { useBoard, useUpdateTask } from "../hooks/useTasks";
import { Column } from "../components/board/Column";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
} from "@dnd-kit/core";
import { useAuth } from "../hooks/useAuth";
import { TaskCardOverlay } from "../components/board/TaskCard";

export const BoardPage = () => {
  const queryClient = useQueryClient();
  const { data: board, isLoading } = useBoard();
  const updateTask = useUpdateTask();
  const { logout, user } = useAuth();

  const [activeTask, setActiveTask] = React.useState<any | null>(null);
  const [movingTaskId, setMovingTaskId] = React.useState<number | null>(null);

  const reorderTasks = useMutation({
    mutationFn: async ({ columnId, tasks }: { columnId: number; tasks: any[] }) => {
      await Promise.all(tasks.map((t, idx) => tasksApi.updateTask(t.id, { order: idx })));
      return columnId;
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", variables.columnId] });
    },
  });

  if (isLoading) return <div className="p-8">Loading board...</div>;
  if (!board) return <div className="p-8">Error loading board</div>;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    if (active.data.current?.type !== "Task") {
      setActiveTask(null);
      return;
    }

    const activeTaskId = (active.data.current as any)?.taskId;
    const activeColumnId = (active.data.current as any)?.columnId;

    if (typeof activeTaskId !== "number") {
      setActiveTask(null);
      return;
    }

    const overType = over.data.current?.type;

    const targetColumnId =
      overType === "Column"
        ? (over.data.current as any)?.columnId
        : overType === "Task"
          ? (over.data.current as any)?.columnId
          : undefined;

    if (typeof targetColumnId !== "number" || Number.isNaN(targetColumnId)) {
      setActiveTask(null);
      return;
    }

    if (activeColumnId === targetColumnId) {
      const key = ["tasks", targetColumnId] as const;
      const current = (queryClient.getQueryData(key) as any[]) ?? [];

      const oldIndex = current.findIndex((t) => t?.id === activeTaskId);
      if (oldIndex === -1) {
        setActiveTask(null);
        return;
      }

      let newIndex = oldIndex;

      if (overType === "Task") {
        const overTaskId = (over.data.current as any)?.taskId;
        if (typeof overTaskId === "number") {
          const idx = current.findIndex((t) => t?.id === overTaskId);
          if (idx !== -1) newIndex = idx;
        }
      } else if (overType === "Column") {
        newIndex = Math.max(0, current.length - 1);
      }

      if (newIndex !== oldIndex) {
        const next = arrayMove(current, oldIndex, newIndex);
        queryClient.setQueryData(key, next);
        reorderTasks.mutate({ columnId: targetColumnId, tasks: next });
      }

      setActiveTask(null);
      return;
    }

    setMovingTaskId(activeTaskId);
    updateTask.mutate(
      { taskId: activeTaskId, data: { columnId: targetColumnId } },
      {
        onSettled: () => {
          setMovingTaskId(null);
          setActiveTask(null);
        },
      },
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type !== "Task") return;
    setActiveTask((event.active.data.current as any)?.task ?? null);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">{board.name}</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <button
            onClick={logout}
            className="text-sm text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto p-6">
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragCancel={() => setActiveTask(null)}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full items-start">
            {board.columns.map((col) => (
              <Column key={col.id} column={col} movingTaskId={movingTaskId} />
            ))}
          </div>
          <DragOverlay dropAnimation={null}>
            {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
};
