import React, { useRef } from "react";
import { useDrag } from "react-dnd";
import type { Task } from "../../types";
import styles from "./index.module.css";

const TASK_ITEM_TYPE = "TASK";

export type TaskDragItem = { type: typeof TASK_ITEM_TYPE; taskId: number; columnId: number };

export function TaskCard({
  task,
  onClick,
  isDraggable = true,
}: {
  task: Task;
  onClick: () => void;
  isDraggable?: boolean;
}) {
  const priorityClass =
    task.priority === "high"
      ? styles.taskPriorityHigh
      : task.priority === "medium"
        ? styles.taskPriorityMedium
        : styles.taskPriorityLow;

  const [{ isDragging }, dragRef] = useDrag({
    type: TASK_ITEM_TYPE,
    item: (): TaskDragItem => ({ type: TASK_ITEM_TYPE, taskId: task.id, columnId: task.columnId }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    canDrag: isDraggable,
  });

  const ref = useRef<HTMLButtonElement>(null);
  const dragRefToUse = isDraggable ? dragRef : undefined;

  return (
    <button
      ref={(el) => {
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
        dragRefToUse?.(el);
      }}
      type="button"
      className={`${styles.taskCard} ${isDragging ? styles.taskCardDragging : ""}`}
      onClick={onClick}
      aria-label={`Open task: ${task.title}`}
    >
      <p className={styles.taskCardTitle}>{task.title}</p>
      <div className={styles.taskCardMeta}>
        <span
          className={`${styles.taskPriority} ${priorityClass}`}
          aria-label={`Priority: ${task.priority}`}
        />
        {task.creatorName != null && task.creatorName !== "" && (
          <span className={styles.taskCardCreator} title="Created by">
            {task.creatorName}
          </span>
        )}
        <span>{new Date(task.updatedAt).toLocaleDateString()}</span>
      </div>
    </button>
  );
}
