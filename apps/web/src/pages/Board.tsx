import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { api } from "../lib/api";
import { Layout } from "../components/Layout";
import { Column } from "../components/Column";
import { TaskCard } from "../components/TaskCard";
import { TaskModal } from "../components/TaskModal";
import { CreateTaskModal } from "../components/CreateTaskModal";
import type { Task, Column as ColumnType } from "../types";

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createColumn, setCreateColumn] = useState<ColumnType | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { data: boardData, isLoading: loadingBoard } = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => api.getBoard(boardId!),
    enabled: !!boardId,
  });

  const { data: tasksData, isLoading: loadingTasks } = useQuery({
    queryKey: ["board", boardId, "tasks"],
    queryFn: () => api.getBoardTasks(boardId!),
    enabled: !!boardId,
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({
      taskId,
      columnId,
      order,
    }: {
      taskId: string;
      columnId: string;
      order?: number;
    }) => api.updateTask(taskId, { columnId, order }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    },
  });

  const columns = boardData?.board.columns || [];
  const allTasks = tasksData?.tasks || [];

  const tasksByColumn = useMemo(() => {
    const filtered = searchQuery
      ? allTasks.filter(
          (task) =>
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : allTasks;

    const grouped: Record<string, Task[]> = {};
    columns.forEach((col) => {
      grouped[col.id] = filtered
        .filter((task) => task.columnId === col.id)
        .sort((a, b) => a.order - b.order);
    });
    return grouped;
  }, [allTasks, columns, searchQuery]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = allTasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = allTasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const overColumn = columns.find((c) => c.id === overId);
    const overTask = allTasks.find((t) => t.id === overId);

    const targetColumnId = overColumn?.id || overTask?.columnId;
    if (!targetColumnId || targetColumnId === activeTask.columnId) return;

    queryClient.setQueryData(
      ["board", boardId, "tasks"],
      (old: { tasks: Task[] } | undefined) => {
        if (!old) return old;
        return {
          tasks: old.tasks.map((t) =>
            t.id === activeId ? { ...t, columnId: targetColumnId } : t
          ),
        };
      }
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeTask = allTasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const overColumn = columns.find((c) => c.id === overId);
    const overTask = allTasks.find((t) => t.id === overId);

    const targetColumnId = overColumn?.id || overTask?.columnId;
    if (!targetColumnId) return;

    const columnTasks = tasksByColumn[targetColumnId] || [];
    const overIndex = overTask
      ? columnTasks.findIndex((t) => t.id === overId)
      : columnTasks.length;

    const newOrder = overIndex;

    updateTaskMutation.mutate({
      taskId: activeId,
      columnId: targetColumnId,
      order: newOrder,
    });
  };

  if (loadingBoard || loadingTasks) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-32">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent mb-4"></div>
          <p className="text-sm font-medium text-slate-600">Loading board...</p>
        </div>
      </Layout>
    );
  }

  if (!boardData?.board) {
    return (
      <Layout>
        <div className="text-center py-32">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 mb-4 mx-auto">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-xl font-bold text-slate-900 mb-4">Board not found</div>
          <button
            className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/30 transition-all cursor-pointer"
            onClick={() => navigate("/boards")}
          >
            Back to Boards
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-8 py-5 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <Link
              to="/boards"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all no-underline border border-slate-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Back
            </Link>
            <div className="w-px h-8 bg-slate-300" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {boardData.board.name}
            </h2>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                className="w-72 pl-11 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 flex gap-6 p-8 overflow-x-auto bg-gradient-to-br from-slate-50/50 to-indigo-50/30">
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                tasks={tasksByColumn[column.id] || []}
                onTaskClick={(task) => setSelectedTask(task)}
                onAddTask={() => setCreateColumn(column)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="w-80">
                <TaskCard task={activeTask} onClick={() => {}} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          columns={columns}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {createColumn && (
        <CreateTaskModal
          columnId={createColumn.id}
          columnName={createColumn.name}
          onClose={() => setCreateColumn(null)}
        />
      )}
    </Layout>
  );
}
