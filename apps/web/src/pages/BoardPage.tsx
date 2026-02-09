import { useState } from "react";
import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { boardsApi, columnsApi, tasksApi, type Task } from "../api/client";
import { BoardColumn } from "../components/BoardColumn";
import { TaskCard } from "../components/TaskCard";
import { TaskModal } from "../components/TaskModal";
import { CreateTaskModal } from "../components/CreateTaskModal";
import { useAuth } from "../contexts/AuthContext";

export function BoardPage() {
  const { logout, user } = useAuth();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createTaskColumnId, setCreateTaskColumnId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch board and columns
  const { data: boards, isLoading: boardsLoading } = useQuery({
    queryKey: ["boards"],
    queryFn: () => boardsApi.getAll(),
  });

  // Auto-create a default board for new users
  const createBoardMutation = useMutation({
    mutationFn: async () => {
      const board = await boardsApi.create({
        name: "My Board",
        description: "Your personal kanban board",
      });
      
      // Create default columns
      await boardsApi.createColumn(board.id, { name: "To Do" });
      await boardsApi.createColumn(board.id, { name: "In Progress" });
      await boardsApi.createColumn(board.id, { name: "Done" });
      
      return board;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      queryClient.invalidateQueries({ queryKey: ["columns"] });
    },
  });

  const boardId = boards?.[0]?.id;

  const { data: columns = [] } = useQuery({
    queryKey: ["columns", boardId],
    queryFn: () => boardsApi.getColumns(boardId!),
    enabled: !!boardId,
  });

  // Fetch tasks for each column using useQueries
  const tasksQueries = useQueries({
    queries: (columns || []).map((column) => ({
      queryKey: ["tasks", column.id],
      queryFn: async () => {
        const result = await columnsApi.getTasks(column.id, { limit: 100 });
        return result.tasks;
      },
    })),
  });

  const allTasks = tasksQueries.flatMap((q) => q.data || []);

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof tasksApi.update>[1] }) =>
      tasksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  function handleDragStart(event: DragStartEvent) {
    const task = allTasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event;

    // We no longer persist changes on every drag over to avoid generating
    // a large number of PATCH requests while the pointer moves.
    // Column changes are now persisted once in handleDragEnd.
    if (!over) return;
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeTaskId = active.id as number;
    const activeTask = allTasks.find((t) => t.id === activeTaskId);
    if (!activeTask) return;

    const overId = over.id as number;
    const overTask = allTasks.find((t) => t.id === overId);

    if (overTask) {
      // If tasks are in the same column, reorder them
      if (activeTask.column_id === overTask.column_id) {
        const columnTasks = allTasks
          .filter((t) => t.column_id === activeTask.column_id)
          .sort((a, b) => a.position - b.position);

        const oldIndex = columnTasks.findIndex((t) => t.id === activeTaskId);
        const newIndex = columnTasks.findIndex((t) => t.id === overId);

        if (oldIndex !== newIndex) {
          // Update position for the moved task
          updateTaskMutation.mutate({
            id: activeTaskId,
            data: { position: newIndex },
          });
        }
      } else {
        // Dropped over a task in a different column: move to that column
        if (activeTask.column_id !== overTask.column_id) {
          updateTaskMutation.mutate({
            id: activeTaskId,
            data: { column_id: overTask.column_id },
          });
        }
      }
    } else {
      // Dropped over a column (over.id is a column id)
      const overColumnId = overId;
      if (activeTask.column_id !== overColumnId) {
        updateTaskMutation.mutate({
          id: activeTaskId,
          data: { column_id: overColumnId },
        });
      }
    }
  }

  // Show loading state while fetching boards
  if (boardsLoading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Loading board...</p>
      </div>
    );
  }

  // Auto-create board for new users
  if (boards && boards.length === 0 && !createBoardMutation.isPending) {
    createBoardMutation.mutate();
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Setting up your board...</p>
      </div>
    );
  }

  // Still creating board
  if (createBoardMutation.isPending) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Setting up your board...</p>
      </div>
    );
  }

  // No boards (shouldn't happen after auto-create, but handle it)
  if (!boards || boards.length === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>No boards available.</p>
      </div>
    );
  }

  const getTasksByColumn = (columnId: number) => {
    return allTasks
      .filter((t) => t.column_id === columnId)
      .sort((a, b) => a.position - b.position);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      <header
        style={{
          backgroundColor: "white",
          borderBottom: "1px solid #e4e6eb",
          padding: "1.25rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div>
          <h1 style={{
            margin: 0,
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "#1c1e21",
            letterSpacing: "-0.02em",
          }}>
            {boards[0]?.name || "Team Boards"}
          </h1>
          {boards[0]?.description && (
            <p style={{
              margin: "0.375rem 0 0 0",
              color: "#65676b",
              fontSize: "0.875rem",
              lineHeight: 1.4,
            }}>
              {boards[0].description}
            </p>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 0.75rem",
            backgroundColor: "#f0f2f5",
            borderRadius: "20px",
          }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "#0084ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 600,
              fontSize: "0.875rem",
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{
              color: "#1c1e21",
              fontSize: "0.9rem",
              fontWeight: 500,
            }}>
              {user?.name}
            </span>
          </div>
          <button
            onClick={logout}
            style={{
              padding: "0.625rem 1.25rem",
              backgroundColor: "white",
              border: "1px solid #e4e6eb",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#65676b",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f0f2f5";
              e.currentTarget.style.borderColor = "#d0d3d9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.borderColor = "#e4e6eb";
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{ padding: "2rem", maxWidth: "1600px", margin: "0 auto" }}>
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              overflowX: "auto",
              paddingBottom: "1rem",
            }}
          >
            {(columns || []).map((column) => (
              <BoardColumn
                key={column.id}
                column={column}
                tasks={getTasksByColumn(column.id)}
                onTaskClick={setSelectedTask}
                onAddTask={setCreateTaskColumnId}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div style={{ cursor: "grabbing" }}>
                <TaskCard task={activeTask} onClick={() => {}} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
          }}
        />
      )}

      {createTaskColumnId && (
        <CreateTaskModal
          columnId={createTaskColumnId}
          onClose={() => setCreateTaskColumnId(null)}
          onCreate={() => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            setCreateTaskColumnId(null);
          }}
        />
      )}
    </div>
  );
}
