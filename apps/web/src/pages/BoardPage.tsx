import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../lib/auth-context";
import { api } from "../lib/api";
import { Column } from "../components/Column";
import { CreateTaskModal } from "../components/CreateTaskModal";
import { TaskDetailsModal } from "../components/TaskDetailsModal";

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const { user, token, logout } = useAuth();
  const queryClient = useQueryClient();
  const BOARD_ID = boardId ? parseInt(boardId, 10) : 1;
  const [searchQuery, setSearchQuery] = useState("");
  const [createTaskColumnId, setCreateTaskColumnId] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const { data: boardData, isLoading: boardLoading } = useQuery({
    queryKey: ["board", BOARD_ID],
    queryFn: () => api.getBoard(BOARD_ID, token!),
    enabled: !!token,
  });

  const { data: columnsData, isLoading: columnsLoading } = useQuery({
    queryKey: ["board", BOARD_ID, "columns"],
    queryFn: () => api.getBoardColumns(BOARD_ID, token!),
    enabled: !!token,
  });

  const moveTaskMutation = useMutation({
    mutationFn: ({ taskId, columnId }: { taskId: number; columnId: number }) =>
      api.updateTask(taskId, { columnId }, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["board"] });
    },
  });

  const handleMoveTask = (taskId: number, newColumnId: number) => {
    moveTaskMutation.mutate({ taskId, columnId: newColumnId });
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
  };

  if (boardLoading || columnsLoading) {
    return (
      <div style={styles.loading}>
        <div>Loading board...</div>
      </div>
    );
  }

  if (!boardData || !columnsData) {
    return (
      <div style={styles.error}>
        <div>Failed to load board</div>
      </div>
    );
  }

  const sortedColumns = [...columnsData.columns].sort(
    (a, b) => a.position - b.position
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.boardTitle}>{boardData.title}</h1>
          {boardData.description && (
            <p style={styles.boardDescription}>{boardData.description}</p>
          )}
        </div>
        <div style={styles.headerActions}>
          <span style={styles.userName}>👤 {user?.name}</span>
          <button onClick={logout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      <div style={styles.controls}>
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.board}>
        {sortedColumns.map((column) => (
          <Column
            key={column.id}
            column={column}
            onTaskClick={handleTaskClick}
            onMoveTask={handleMoveTask}
            onCreateTask={setCreateTaskColumnId}
            columns={sortedColumns}
            searchQuery={searchQuery}
          />
        ))}
      </div>

      {createTaskColumnId && (
        <CreateTaskModal
          columnId={createTaskColumnId}
          onClose={() => setCreateTaskColumnId(null)}
        />
      )}

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    fontFamily: "system-ui, sans-serif",
  },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    fontSize: "16px",
    color: "#666",
  },
  error: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    fontSize: "16px",
    color: "#dc3545",
  },
  header: {
    backgroundColor: "white",
    borderBottom: "1px solid #e0e0e0",
    padding: "20px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  boardTitle: {
    margin: "0 0 4px 0",
    fontSize: "24px",
    fontWeight: "600" as const,
    color: "#333",
  },
  boardDescription: {
    margin: 0,
    fontSize: "14px",
    color: "#666",
  },
  headerActions: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
  },
  userName: {
    fontSize: "14px",
    color: "#666",
  },
  logoutButton: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "500" as const,
    color: "white",
    backgroundColor: "#dc3545",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  controls: {
    padding: "16px 24px",
    backgroundColor: "white",
    borderBottom: "1px solid #e0e0e0",
  },
  searchInput: {
    width: "100%",
    maxWidth: "400px",
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    outline: "none",
  },
  board: {
    display: "flex",
    gap: "20px",
    padding: "24px",
    overflowX: "auto" as const,
    alignItems: "flex-start",
  },
};
