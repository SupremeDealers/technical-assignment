import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { boards, columns as columnsApi, tasks as tasksApi, type Column } from "../../api/client";
import { useAuth } from "../../auth/context";
import { TaskCard, type TaskDragItem } from "../../components/TaskCard";
import { TaskDetail } from "../../components/TaskDetail";
import styles from "./index.module.css";

const BOARD_ID = 1;
const TASK_ITEM_TYPE = "TASK";

export function Board() {
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [createColumnTitle, setCreateColumnTitle] = useState("");

  const { data: board, isLoading: boardLoading, error: boardError } = useQuery({
    queryKey: ["board", BOARD_ID],
    queryFn: () => boards.get(BOARD_ID),
  });

  const { data: columnsList = [], isLoading: columnsLoading } = useQuery({
    queryKey: ["boards", BOARD_ID, "columns"],
    queryFn: () => boards.getColumns(BOARD_ID),
  });

  const createColumn = useMutation({
    mutationFn: (title: string) => boards.createColumn(BOARD_ID, { title }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["boards", BOARD_ID, "columns"] }),
  });

  const moveTask = useMutation({
    mutationFn: ({ taskId, columnId }: { taskId: number; columnId: number }) =>
      tasksApi.patch(taskId, { columnId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards", BOARD_ID, "columns"] });
      queryClient.invalidateQueries({ queryKey: ["columns"] });
    },
  });

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    const t = createColumnTitle.trim();
    if (t) {
      createColumn.mutate(t);
      setCreateColumnTitle("");
    }
  };

  const handleMoveTask = (taskId: number, targetColumnId: number) => {
    moveTask.mutate({ taskId, columnId: targetColumnId });
  };

  if (boardLoading || columnsLoading) {
    return (
      <div className={styles.boardLayout}>
        <div className={styles.boardLoading} role="status" aria-live="polite">
          Loading board…
        </div>
      </div>
    );
  }

  if (boardError || !board) {
    return (
      <div className={styles.boardLayout}>
        <div className={styles.boardError} role="alert">
          Failed to load board. Check your connection and try again.
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.boardLayout}>
        <header className={styles.boardHeader}>
          <div className={styles.boardHeaderInner}>
            <h1 className={styles.boardTitle}>{board.title}</h1>
            <div className={styles.boardActions}>
              <input
                type="search"
                placeholder="Search tasks…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.boardSearch}
                aria-label="Search tasks"
              />
              <span className={styles.boardUser} aria-label={`Signed in as ${user?.email}`}>
                {user?.name}
              </span>
              <button type="button" onClick={logout} className={styles.boardLogout}>
                Log out
              </button>
            </div>
          </div>
        </header>

        <main className={styles.boardMain}>
          <div className={styles.boardColumns}>
            {columnsList.map((col) => (
              <ColumnColumn
                key={col.id}
                column={col}
                search={search}
                onSelectTask={setSelectedTaskId}
                onMoveTask={handleMoveTask}
                styles={styles}
              />
            ))}
            <div className={`${styles.boardColumn} ${styles.boardColumnAdd}`}>
              <form onSubmit={handleAddColumn} className={styles.columnAddForm}>
                <input
                  type="text"
                  placeholder="Add column"
                  value={createColumnTitle}
                  onChange={(e) => setCreateColumnTitle(e.target.value)}
                  className={styles.columnAddInput}
                  aria-label="New column title"
                />
                <button type="submit" className={styles.columnAddBtn} disabled={createColumn.isPending || !createColumnTitle.trim()}>
                  Add
                </button>
              </form>
            </div>
          </div>
        </main>

        {selectedTaskId && (
          <TaskDetail
            taskId={selectedTaskId}
            onClose={() => setSelectedTaskId(null)}
            onDeleted={() => setSelectedTaskId(null)}
          />
        )}
      </div>
    </DndProvider>
  );
}

function ColumnColumn({
  column,
  search,
  onSelectTask,
  onMoveTask,
  styles: s,
}: {
  column: Column;
  search: string;
  onSelectTask: (id: number) => void;
  onMoveTask: (taskId: number, targetColumnId: number) => void;
  styles: Record<string, string>;
}) {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["columns", column.id, "tasks", search],
    queryFn: () => columnsApi.getTasks(column.id, { search: search || undefined, limit: 50 }),
  });

  const [{ isOver }, dropRef] = useDrop<TaskDragItem, void, { isOver: boolean }>({
    accept: TASK_ITEM_TYPE,
    drop: (item) => {
      if (item.columnId !== column.id) {
        onMoveTask(item.taskId, column.id);
      }
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  const createTask = useMutation({
    mutationFn: (body: { title: string; description?: string; priority?: string }) =>
      columnsApi.createTask(column.id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns", column.id, "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["boards", column.boardId, "columns"] });
    },
  });

  const tasks = data?.tasks ?? [];
  const isEmpty = !isLoading && !error && tasks.length === 0;

  return (
    <div className={s.boardColumn}>
      <div className={s.columnHeader}>
        <h2 className={s.columnTitle}>{column.title}</h2>
        <span className={s.columnCount} aria-label={`${column.taskCount} tasks`}>
          {data?.total ?? column.taskCount}
        </span>
      </div>
      <div
        ref={dropRef}
        className={`${s.columnBody} ${isOver ? s.columnBodyDrop : ""}`}
      >
        {isLoading && (
          <p className={s.columnLoading} aria-live="polite">
            Loading…
          </p>
        )}
        {error && (
          <p className={s.columnError} role="alert">
            Failed to load tasks
          </p>
        )}
        {!isLoading && !error && (
          <>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={() => onSelectTask(task.id)} />
            ))}
            {isEmpty && (
              <p className={s.columnEmpty}>No tasks yet</p>
            )}
            <AddTaskForm columnId={column.id} onCreate={createTask.mutate} styles={s} />
          </>
        )}
      </div>
    </div>
  );
}

function AddTaskForm({
  columnId: _columnId,
  onCreate,
  styles: s,
}: {
  columnId: number;
  onCreate: (body: { title: string; description?: string; priority?: string }) => void;
  styles: Record<string, string>;
}) {
  const [title, setTitle] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (t) {
      onCreate({ title: t });
      setTitle("");
      setOpen(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        className={s.taskAddTrigger}
        onClick={() => setOpen(true)}
        aria-label="Add task"
      >
        + Add task
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={s.taskAddForm}>
      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={s.taskAddInput}
        autoFocus
        aria-label="Task title"
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
      />
      <div className={s.taskAddActions}>
        <button type="submit" className={s.taskAddSubmit} disabled={!title.trim()}>
          Add
        </button>
        <button type="button" className={s.taskAddCancel} onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
