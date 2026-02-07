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
import { getBoard, getTasks, updateTask, getBoardRole, getBoardHeatmap, TaskWithDetails, ColumnHeatmapData } from "../../api/client";
import { Header } from "../../components/Header";
import { Loading } from "../../components/Loading";
import { OfflineIndicator } from "../../components/OfflineIndicator";
import { BoardColumn } from "./BoardColumn";
import { TaskCard } from "./TaskCard";
import { TaskModal } from "./TaskModal";
import { BoardMembers } from "./BoardMembers";
import { BoardAnalyticsPanel } from "./BoardAnalytics";
import { ActivityLog } from "./ActivityLog";
import { NotificationsPanel, NotificationBell } from "./Notifications";
import { KeyboardShortcutsModal, useKeyboardShortcuts } from "./KeyboardShortcuts";
import { useOnlineStatus } from "../../hooks/useOffline";
import "./BoardPage.css";
import "./BoardAnalytics.css";
import "./ActivityLog.css";
import "./Notifications.css";
import "./KeyboardShortcuts.css";
import "../../components/OfflineIndicator.css";

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  useOnlineStatus(); // Track online status for offline indicator

  const [activeTask, setActiveTask] = useState<TaskWithDetails | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onToggleAnalytics: () => setShowAnalytics(prev => !prev),
    onToggleActivity: () => setShowActivity(prev => !prev),
    onToggleMembers: () => setShowMembers(prev => !prev),
    onToggleShortcuts: () => setShowShortcuts(prev => !prev),
  });

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

  const { data: roleData } = useQuery({
    queryKey: ["board-role", boardId],
    queryFn: () => getBoardRole(token!, boardId!),
    enabled: !!token && !!boardId,
  });

  const userRole = roleData?.role;
  const isOwner = userRole === "owner";
  // isAdmin indicates owner or admin role for permission checks
  void (isOwner); // Used in JSX conditionally

  const columns = boardData?.board.columns || [];
  
  // Fetch board heatmap data for friction detection
  const { data: heatmapData } = useQuery({
    queryKey: ["board-heatmap", boardId],
    queryFn: () => getBoardHeatmap(token!, boardId!),
    enabled: !!token && !!boardId,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000,
  });

  // Create a map for quick lookup
  const heatmapByColumn: Record<string, ColumnHeatmapData> = {};
  if (heatmapData?.heatmap) {
    for (const data of heatmapData.heatmap) {
      heatmapByColumn[data.column_id] = data;
    }
  }
  
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
    // Optimistic update
    onMutate: async ({ taskId, columnId, position }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["board-tasks", boardId] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<Record<string, TaskWithDetails[]>>(["board-tasks", boardId, searchQuery]);

      // Optimistically update to the new value
      if (previousTasks) {
        const newTasks = { ...previousTasks };
        let movedTask: TaskWithDetails | undefined;

        // Find and remove the task from its current column
        for (const colId of Object.keys(newTasks)) {
          const taskIndex = newTasks[colId].findIndex((t) => t.id === taskId);
          if (taskIndex > -1) {
            movedTask = { ...newTasks[colId][taskIndex], column_id: columnId, position };
            newTasks[colId] = newTasks[colId].filter((t) => t.id !== taskId);
            break;
          }
        }

        // Add the task to the new column at the correct position
        if (movedTask) {
          if (!newTasks[columnId]) {
            newTasks[columnId] = [];
          }
          newTasks[columnId] = [
            ...newTasks[columnId].slice(0, position),
            movedTask,
            ...newTasks[columnId].slice(position),
          ];
        }

        queryClient.setQueryData(["board-tasks", boardId, searchQuery], newTasks);
      }

      setPendingChanges((prev) => prev + 1);

      return { previousTasks };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["board-tasks", boardId, searchQuery], context.previousTasks);
      }
      setPendingChanges((prev) => Math.max(0, prev - 1));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-tasks", boardId] });
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      queryClient.invalidateQueries({ queryKey: ["board-activities", boardId] });
      queryClient.invalidateQueries({ queryKey: ["board-heatmap", boardId] });
      setPendingChanges((prev) => Math.max(0, prev - 1));
    },
    // Retry logic for offline support
    retry: (failureCount) => {
      // Retry up to 3 times if network error
      if (!navigator.onLine) return true;
      if (failureCount < 3) return true;
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowAnalytics(!showAnalytics)}
              aria-label="View analytics"
              title="Board Analytics"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 20V10M12 20V4M6 20v-6" />
              </svg>
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowActivity(!showActivity)}
              aria-label="View activity log"
              title="Activity Log"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4l3 3" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="View notifications"
              title="Notifications"
            >
              <NotificationBell />
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowMembers(true)}
              aria-label="Manage board members"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Members
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowShortcuts(true)}
              aria-label="Keyboard shortcuts"
              title="Keyboard Shortcuts (?)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10" />
              </svg>
            </button>
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
                heatmapData={heatmapByColumn[column.id]}
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

        {showMembers && (
          <BoardMembers
            boardId={boardId!}
            isOwner={isOwner}
            onClose={() => setShowMembers(false)}
          />
        )}

        {showNotifications && (
          <NotificationsPanel
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        )}

        {showShortcuts && (
          <KeyboardShortcutsModal
            isOpen={showShortcuts}
            onClose={() => setShowShortcuts(false)}
          />
        )}
      </main>

      {/* Side Panels */}
      {(showAnalytics || showActivity) && (
        <aside className="board-side-panel">
          {showAnalytics && (
            <BoardAnalyticsPanel
              boardId={boardId!}
              onClose={() => setShowAnalytics(false)}
            />
          )}
          {showActivity && (
            <ActivityLog
              boardId={boardId!}
              onClose={() => setShowActivity(false)}
            />
          )}
        </aside>
      )}

      {/* Offline Indicator */}
      <OfflineIndicator pendingCount={pendingChanges} />
    </>
  );
}
