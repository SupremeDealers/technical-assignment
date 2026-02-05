import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasks as tasksApi, boards, type Task, type Comment } from "../../api/client";
import styles from "./index.module.css";

export function TaskDetail({
  taskId,
  onClose,
  onDeleted,
}: {
  taskId: number;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const queryClient = useQueryClient();
  const overlayRef = useRef<HTMLDivElement>(null);

  const { data: task, isLoading, error } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => tasksApi.get(taskId),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["tasks", taskId, "comments"],
    queryFn: () => tasksApi.getComments(taskId),
    enabled: !!taskId,
  });

  const { data: columns = [] } = useQuery({
    queryKey: ["boards", 1, "columns"],
    queryFn: () => boards.getColumns(1),
  });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (isLoading) {
    return (
      <div className={styles.overlay} ref={overlayRef} onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="Task details">
        <div className={styles.panel}>
          <p className={styles.loading}>Loading…</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className={styles.overlay} ref={overlayRef} onClick={handleOverlayClick} role="dialog" aria-modal="true">
        <div className={styles.panel}>
          <p className={styles.error} role="alert">Failed to load task.</p>
          <button type="button" onClick={onClose} className={styles.close}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-detail-title"
    >
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 id="task-detail-title" className={styles.titleInner}>Task details</h2>
          <button
            type="button"
            onClick={onClose}
            className={styles.close}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <TaskDetailForm
          task={task}
          columns={columns}
          onDeleted={onDeleted}
          onUpdate={() => queryClient.invalidateQueries({ queryKey: ["task", taskId] })}
        />
        <CommentsSection taskId={taskId} comments={comments} onAdd={() => queryClient.invalidateQueries({ queryKey: ["tasks", taskId, "comments"] })} />
      </div>
    </div>
  );
}

function TaskDetailForm({
  task,
  columns,
  onDeleted,
  onUpdate,
}: {
  task: Task;
  columns: { id: number; title: string }[];
  onDeleted: () => void;
  onUpdate: () => void;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState(task.priority);
  const [columnId, setColumnId] = useState(task.columnId);

  const patchTask = useMutation({
    mutationFn: (body: Parameters<typeof tasksApi.patch>[1]) => tasksApi.patch(task.id, body),
    onSuccess: (updated) => {
      setTitle(updated.title);
      setDescription(updated.description ?? "");
      setPriority(updated.priority);
      setColumnId(updated.columnId);
      onUpdate();
      queryClient.invalidateQueries({ queryKey: ["columns"] });
      queryClient.invalidateQueries({ queryKey: ["boards", 1, "columns"] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: () => tasksApi.delete(task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns"] });
      queryClient.invalidateQueries({ queryKey: ["boards", 1, "columns"] });
      onDeleted();
    },
  });

  const handleBlur = () => {
    if (title.trim() !== task.title || description !== (task.description ?? "") || priority !== task.priority) {
      patchTask.mutate({ title: title.trim() || task.title, description: description || null, priority });
    }
  };

  const handleMove = (newColumnId: number) => {
    if (newColumnId === columnId) return;
    setColumnId(newColumnId);
    patchTask.mutate({ columnId: newColumnId });
  };

  return (
    <div className={styles.form}>
      <label htmlFor="task-detail-title-input" className={styles.label}>Title</label>
      <input
        id="task-detail-title-input"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleBlur}
        className={`${styles.input} ${styles.titleInput}`}
        aria-label="Task title"
      />
      <label htmlFor="task-detail-desc" className={styles.label}>Description</label>
      <textarea
        id="task-detail-desc"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={handleBlur}
        className={`${styles.input} ${styles.textarea}`}
        rows={4}
        aria-label="Task description"
      />
      <div className={styles.row}>
        <div>
          <label htmlFor="task-detail-priority" className={styles.label}>Priority</label>
          <select
            id="task-detail-priority"
            value={priority}
            onChange={(e) => {
              const p = e.target.value as Task["priority"];
              setPriority(p);
              patchTask.mutate({ priority: p });
            }}
            className={styles.select}
            aria-label="Task priority"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label htmlFor="task-detail-column" className={styles.label}>Column</label>
          <select
            id="task-detail-column"
            value={columnId}
            onChange={(e) => handleMove(Number(e.target.value))}
            className={styles.select}
            aria-label="Move to column"
          >
            {columns.map((col) => (
              <option key={col.id} value={col.id}>{col.title}</option>
            ))}
          </select>
        </div>
      </div>
      <p className={styles.meta}>
        {task.creatorName != null && task.creatorName !== "" && (
          <>Created by {task.creatorName} · </>
        )}
        Updated {new Date(task.updatedAt).toLocaleString()}
      </p>
      <button
        type="button"
        onClick={() => deleteTask.mutate()}
        className={styles.delete}
        disabled={deleteTask.isPending}
        aria-label="Delete task"
      >
        {deleteTask.isPending ? "Deleting…" : "Delete task"}
      </button>
    </div>
  );
}

function CommentsSection({
  taskId,
  comments,
  onAdd,
}: {
  taskId: number;
  comments: Comment[];
  onAdd: () => void;
}) {
  const [body, setBody] = useState("");
  const addComment = useMutation({
    mutationFn: () => tasksApi.addComment(taskId, { body: body.trim() }),
    onSuccess: () => {
      setBody("");
      onAdd();
    },
  });

  return (
    <div className={styles.comments}>
      <h3 className={styles.commentsTitle}>Comments</h3>
      <ul className={styles.commentsList} aria-label="Comments">
        {comments.length === 0 && (
          <li className={styles.commentsEmpty}>No comments yet.</li>
        )}
        {comments.map((c) => (
          <li key={c.id} className={styles.comment}>
            <p className={styles.commentBody}>{c.body}</p>
            <p className={styles.commentMeta}>
              {c.authorName} · {new Date(c.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (body.trim()) addComment.mutate();
        }}
        className={styles.commentForm}
      >
        <label htmlFor="task-detail-comment-input" className={styles.label}>Add comment</label>
        <textarea
          id="task-detail-comment-input"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a comment…"
          className={`${styles.input} ${styles.textarea}`}
          rows={3}
          aria-label="Comment text"
        />
        <button
          type="submit"
          className={styles.commentSubmit}
          disabled={addComment.isPending || !body.trim()}
        >
          {addComment.isPending ? "Sending…" : "Save Details"}
        </button>
      </form>
    </div>
  );
}
