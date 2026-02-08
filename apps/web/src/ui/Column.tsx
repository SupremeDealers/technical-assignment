import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getColumnTasks } from "../api/tasks";
import { TaskCard } from "./TaskCard";
import { TaskModal } from "./TaskModal";
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface ColumnProps {
  column: {
    id: string;
    title: string;
  };
  search: string;
  onAddTask: () => void;
}

export function Column({ column, search, onAddTask }: ColumnProps) {
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const { data: tasksData } = useQuery({
    queryKey: ["tasks", column.id, search],
    queryFn: () => getColumnTasks(column.id, { search }),
  });

  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      columnId: column.id
    }
  });

  const tasks = tasksData?.tasks || [];

  return (
    <div 
      ref={setNodeRef} 
      className="column" 
      style={{ background: isOver ? "#f8fafc" : "white" }}
    >
      <div className="column-header">
        <div className="column-title">
          {column.title}
          <span className="task-count">{tasksData?.pagination.total || 0}</span>
        </div>
        <button className="btn-add-column" onClick={onAddTask}>+</button>
      </div>
      
      <div className="task-list">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onClick={() => setSelectedTask(task)}
            />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && !isOver && (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            No tasks.
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
        />
      )}
    </div>
  );
}
