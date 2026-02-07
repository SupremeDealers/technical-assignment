import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { useAuth } from "../../contexts/AuthContext";
import { getBoard, getTasks, updateTask, TaskWithDetails } from "../../api/client";
import { Header } from "../../components/Header";
import { Loading } from "../../components/Loading";
import { BoardColumn } from "./BoardColumn";
import { TaskCard } from "./TaskCard";
import { TaskModal } from "./TaskModal";
import "./BoardPage.css";

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [activeTask, setActiveTask] = useState<TaskWithDetails | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const {
    data: boardData,
    isLoading: boardLoading,
    error: boardError,
  } = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => getBoard(token!, boardId!),
    enabled: !!token && !!boardId,
  });

  const columns = boardData?.board.columns || [];
  
  const taskQueries = useQuery({
    queryKey: ["board-tasks", boardId, searchQuery],
    queryFn: async () => {
      const results: Record<string, TaskWithDetails[]> = {};
      
      for (const column of columns) {
        const response = await getTasks(token!, column.id, {
          search: searchQuery || undefined,
          limit: 100,
        });
        results[column.id] = response.data;
      }
      
      return results;
    },
    enabled: !!token && columns.length > 0,
  });

  const moveTaskMutation = useMutation({
    mutationFn: async ({
      taskId,
      columnId,
      position,
    }: {
      taskId: string;
      columnId: string;
      position: number;
    }) => {
      return updateTask(token!, taskId, { column_id: columnId, position });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-tasks", boardId] });
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
    },
  });

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const task = findTaskById(active.id as string);
    if (task) {
      setActiveTask(task);
    }
  }, [taskQueries.data]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);

      if (!over) return;

      const taskId = active.id as string;
      const task = findTaskById(taskId);
      
      if (!task) return;

      let targetColumnId = over.id as string;
      let targetPosition = 0;

      const overTask = findTaskById(over.id as string);
      if (overTask) {
        targetColumnId = overTask.column_id;
        const columnTasks = taskQueries.data?.[targetColumnId] || [];
        const overIndex = columnTasks.findIndex((t) => t.id === over.id);
        targetPosition = overIndex >= 0 ? overIndex : columnTasks.length;
      } else {
        const columnTasks = taskQueries.data?.[targetColumnId] || [];
        targetPosition = columnTasks.length;
      }

      if (task.column_id !== targetColumnId || task.position !== targetPosition) {
        moveTaskMutation.mutate({
          taskId,
          columnId: targetColumnId,
          position: targetPosition,
        });
      }
    },
    [taskQueries.data, moveTaskMutation]
  );

  const findTaskById = (taskId: string): TaskWithDetails | undefined => {
    if (!taskQueries.data) return undefined;
    
    for (const tasks of Object.values(taskQueries.data)) {
      const task = tasks.find((t) => t.id === taskId);
      if (task) return task;
    }
    return undefined;
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const handleCloseTaskModal = () => {
    setSelectedTaskId(null);
  };

  if (boardLoading) {
    return (
      <>
        <Header />
        <Loading fullPage text="Loading board..." />
      </>
    );
  }

  if (boardError || !boardData) {
    return (
      <>
        <Header />
        <div className="board-error">
          <h2>Board not found</h2>
          <p>The board you're looking for doesn't exist or you don't have access.</p>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Go to boards
          </button>
        </div>
      </>
    );
  }

  const board = boardData.board;

  return (
    <>
      <Header />
      <main className="board-page">
        <div className="board-header">
          <div className="board-header-left">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate("/")}
              aria-label="Back to boards"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <h1>{board.name}</h1>
          </div>
          <div className="board-header-right">
            <div className="search-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="search"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search tasks"
              />
            </div>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="board-columns">
            {columns.map((column) => (
              <BoardColumn
                key={column.id}
                column={column}
                tasks={taskQueries.data?.[column.id] || []}
                isLoading={taskQueries.isLoading}
                onTaskClick={handleTaskClick}
                boardId={boardId!}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && (
              <TaskCard task={activeTask} isDragging onClick={() => {}} />
            )}
          </DragOverlay>
        </DndContext>

        {selectedTaskId && (
          <TaskModal
            taskId={selectedTaskId}
            boardId={boardId!}
            columns={columns}
            onClose={handleCloseTaskModal}
          />
        )}
      </main>
    </>
  );
}
