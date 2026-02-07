import React from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import type { Column, Task } from "../types";
import { useBoard, useColumns, useTasks, useTaskMutations } from "../queries";
import { LoadingState, ErrorState, EmptyState } from "../components/States";
import { TaskCard } from "../components/TaskCard";
import { TaskDetails } from "../components/TaskDetails";
import { BoardHeader } from "../components/board/BoardHeader";
import { CreateTaskDrawer } from "../components/CreateTaskDrawer";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { getColumnIcon, getColumnIconColor } from "../lib/column-icons";

export function Board() {
  const { boardId } = useParams();
  const id = boardId ?? "";
  const boardQuery = useBoard(id);
  const columnsQuery = useColumns(id);
  const [search, setSearch] = React.useState("");
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [showCreateDrawer, setShowCreateDrawer] = React.useState(false);
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);
  const tasks = useTaskMutations(id);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task;
    setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newColumnId = over.id as string;
    const task = active.data.current?.task as Task;

    if (task && task.columnId !== newColumnId) {
      tasks.update.mutate({ taskId, payload: { columnId: newColumnId } });
    }
  };

  if (!boardId) return <ErrorState message="Missing board id." />;
  if (boardQuery.isLoading || columnsQuery.isLoading) {
    return <LoadingState label="Loading board..." />;
  }
  if (boardQuery.error) return <ErrorState message={(boardQuery.error as Error).message} />;
  if (columnsQuery.error) return <ErrorState message={(columnsQuery.error as Error).message} />;

  const columns = columnsQuery.data ?? [];
  if (!boardQuery.data) return <EmptyState message="Board not found." />;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        <BoardHeader 
          board={boardQuery.data} 
          search={search} 
          onSearchChange={setSearch}
          onAddTask={() => setShowCreateDrawer(true)}
        />

        {columns.length === 0 ? (
          <EmptyState message="No columns yet. Create your first column to get started." />
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((column) => (
              <ColumnView
                key={column.id}
                column={column}
                columns={columns}
                search={search}
                onSelectTask={setSelectedTask}
                onMoveTask={(taskId, columnId) =>
                  tasks.update.mutate({ taskId, payload: { columnId } })
                }
                onDeleteTask={(taskId) => tasks.remove.mutate(taskId)}
              />
            ))}
          </div>
        )}

        {selectedTask ? (
          <TaskDetails
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={(taskId, payload) => tasks.update.mutate({ taskId, payload })}
          />
        ) : null}

        <CreateTaskDrawer
          open={showCreateDrawer}
          columns={columns}
          onClose={() => setShowCreateDrawer(false)}
          onCreate={(columnId, payload) => {
            tasks.create.mutate({ columnId, payload });
          }}
        />
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="task-card-dragging">
            <TaskCard
              task={activeTask}
              columns={columns}
              onMove={() => {}}
              onSelect={() => {}}
              onDelete={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function ColumnView({
  column,
  columns,
  search,
  onSelectTask,
  onMoveTask,
  onDeleteTask,
}: {
  column: Column;
  columns: Column[];
  search: string;
  onSelectTask: (task: Task) => void;
  onMoveTask: (taskId: string, columnId: string) => void;
  onDeleteTask: (taskId: string) => void;
}) {
  const [page, setPage] = React.useState(1);
  const tasksQuery = useTasks(column.id, { search, page, limit: 5, sort: "createdAt" });

  React.useEffect(() => {
    setPage(1);
  }, [search, column.id]);

  const ColumnIcon = getColumnIcon(column.title);
  const iconColor = getColumnIconColor(column.title);
  
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <section 
      ref={setNodeRef}
      className={`column-container flex flex-col min-h-[300px] max-h-[calc(100vh-220px)] transition-colors ${
        isOver ? 'ring-2 ring-primary ring-offset-2' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
          <ColumnIcon className={`h-4 w-4 ${iconColor}`} />
          {column.title}
          <Badge variant="secondary" className="font-normal text-xs">
            {column.taskCount}
          </Badge>
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2">
        {tasksQuery.isLoading ? (
          <LoadingState label="Loading tasks..." size="sm" />
        ) : tasksQuery.error ? (
          <ErrorState message={(tasksQuery.error as Error).message} />
        ) : (tasksQuery.data?.items.length ?? 0) === 0 ? (
          <EmptyState
            message={search ? "No matching tasks" : "No tasks yet"}
            className="py-6"
          />
        ) : (
          tasksQuery.data?.items.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columns={columns}
              onMove={onMoveTask}
              onSelect={onSelectTask}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </div>

      {tasksQuery.data && tasksQuery.data.totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2 pt-3 border-t mt-3">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            {page} / {tasksQuery.data.totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => setPage((p) => Math.min(tasksQuery.data?.totalPages ?? p, p + 1))}
            disabled={page >= tasksQuery.data.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
    </section>
  );
}
