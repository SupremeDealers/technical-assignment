import React, { useState } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { getColumnTasks } from "../api/tasks";
import { TaskCard } from "./TaskCard";
import { TaskModal } from "./TaskModal";
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ColumnProp } from "./uiTypes";



export function Column({ column, search, onAddTask }: ColumnProp) {
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [sort, setSort] = useState("priority_desc");

  const queryClient = useQueryClient();

  const { data: tasksData, isPlaceholderData } = useQuery({
    queryKey: ["tasks", column.id, search, page, limit, sort],
    queryFn: () => getColumnTasks(column.id, { search, page, limit, sort }),
    placeholderData: keepPreviousData,
  });

  // Prefetch the next page
  React.useEffect(() => {
    if (!isPlaceholderData && tasksData?.pagination?.totalPages && page < tasksData.pagination.totalPages) {
      queryClient.prefetchQuery({
        queryKey: ["tasks", column.id, search, page + 1, limit, sort],
        queryFn: () => getColumnTasks(column.id, { search, page: page + 1, limit, sort }),
      });
    }
  }, [tasksData, isPlaceholderData, page, queryClient, column.id, search, limit, sort]);

  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      columnId: column.id
    }
  });

  const tasks = tasksData?.tasks || [];
  const pagination = tasksData?.pagination;
  const totalPages = pagination?.totalPages || 1;

  return (
    <div 
      ref={setNodeRef} 
      className="column" 
      style={{ background: isOver ? "#f8fafc" : "white" }}
    >
      <div className="column-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="column-title">
            {column.title}
            <span className="task-count">{pagination?.total || 0}</span>
          </div>
          <button className="btn-add-column" onClick={onAddTask}>+</button>
        </div>
        
        <select 
          value={sort} 
          onChange={(e) => setSort(e.target.value)}
          style={{ 
            fontSize: '0.75rem', 
            padding: '4px', 
            border: '1px solid #e2e8f0', 
            borderRadius: '4px',
            color: '#64748b',
            background: 'white',
            cursor: 'pointer'
          }}
        >
          <option value="priority_desc">High Priority</option>
          <option value="priority_asc">Low Priority</option>
          <option value="createdAt_desc">Newest</option>
          <option value="createdAt_asc">Oldest</option>
        </select>
      </div>
      
      <div className="task-list">
        <SortableContext items={tasks.map((t: any) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task: any) => (
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

      {totalPages > 1 && (
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          padding: "0.5rem 1rem", 
          borderTop: "1px solid #e2e8f0",
          marginTop: "auto" 
        }}>
          <button 
            disabled={page === 1}
            onClick={() => setPage(old => Math.max(old - 1, 1))}
            style={{ 
              background: "none", 
              border: "none", 
              cursor: page === 1 ? "default" : "pointer",
              opacity: page === 1 ? 0.5 : 1,
              fontSize: "0.875rem" 
            }}
          >
            &lt;
          </button>
          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
            {page} / {totalPages}
          </span>
          <button 
            disabled={isPlaceholderData || page === totalPages}
            onClick={() => {
              if (!isPlaceholderData && page < totalPages) {
                setPage(old => old + 1);
              }
            }}
            style={{ 
              background: "none", 
              border: "none", 
              cursor: (isPlaceholderData || page === totalPages) ? "default" : "pointer",
              opacity: (isPlaceholderData || page === totalPages) ? 0.5 : 1,
              fontSize: "0.875rem"
            }}
          >
            &gt;
          </button>
        </div>
      )}

      {selectedTask && (
        <TaskModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
        />
      )}
    </div>
  );
}
