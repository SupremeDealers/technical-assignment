import React from "react";
import { Column as IColumn } from "../../api/tasks";
import { TaskCard } from "./TaskCard";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useTasks } from "../../hooks/useTasks";
import { Plus } from "lucide-react";
import { useCreateTaskModal } from "../../hooks/useCreateTaskModal";

interface ColumnProps {
  column: IColumn;
  movingTaskId?: number | null;
}

export const Column: React.FC<ColumnProps> = ({ column, movingTaskId }) => {
  const onOpen = useCreateTaskModal((s) => s.onOpen);

  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);
  const [sort, setSort] = React.useState<'order' | 'createdAt' | 'priority'>('order');

  React.useEffect(() => {
    setPage(1);
  }, [search, limit, sort]);

  const queryKey = ['tasks', column.id, search.trim(), page, limit, sort] as const;
  const dndEnabled = sort === 'order' && search.trim().length === 0 && page === 1;

  const { data, isLoading, isError } = useTasks(column.id, {
    search,
    page,
    limit,
    sort,
  });

  const tasks = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const { setNodeRef } = useDroppable({
    id: `column-${column.id}`,
    data: { type: 'Column', columnId: column.id, column, queryKey, dndEnabled },
  });

  return (
    <div className="flex flex-col w-80 shrink-0">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="font-semibold text-gray-700">{column.title}</h3>
        <span className="text-gray-400 text-sm bg-gray-100 px-2 py-0.5 rounded-full">
          {total}
        </span>
      </div>

      <div className="px-1 mb-3 space-y-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full rounded-md border border-gray-300 p-2 text-sm"
          placeholder="Search tasks..."
          aria-label={`Search tasks in ${column.title}`}
        />

        <div className="grid grid-cols-2 gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="block w-full rounded-md border border-gray-300 p-2 text-sm"
            aria-label={`Sort tasks in ${column.title}`}
          >
            <option value="order">Order</option>
            <option value="createdAt">Created</option>
            <option value="priority">Priority</option>
          </select>

          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="block w-full rounded-md border border-gray-300 p-2 text-sm"
            aria-label={`Tasks per page in ${column.title}`}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <button
            type="button"
            className="px-2 py-1 rounded border border-gray-300 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Prev
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            className="px-2 py-1 rounded border border-gray-300 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>

        {!dndEnabled ? (
          <div className="text-xs text-gray-500">
            Drag-and-drop is available only when sorting by Order (page 1, no search).
          </div>
        ) : null}
      </div>

      <div
        ref={setNodeRef}
        className="bg-gray-50 flex-1 rounded-lg p-2 min-h-[500px] flex flex-col gap-2"
      >
        {isLoading ? (
          <div className="p-2 text-sm text-gray-600">Loading tasks...</div>
        ) : isError ? (
          <div className="p-2 text-sm text-red-600">Failed to load tasks.</div>
        ) : tasks.length === 0 ? (
          <div className="p-2 text-sm text-gray-500">No tasks.</div>
        ) : (
          <SortableContext
            items={tasks.map((t) => `task-${t.id}`)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                forceHidden={movingTaskId === task.id}
                queryKey={queryKey}
                dndEnabled={dndEnabled}
              />
            ))}
          </SortableContext>
        )}

        <button
          onClick={() => onOpen(column.id)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-2 rounded transition-colors text-sm"
        >
          <Plus size={16} /> Add Task
        </button>
      </div>
    </div>
  );
};
