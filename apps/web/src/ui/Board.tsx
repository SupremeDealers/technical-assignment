import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBoardColumns, getBoards } from "../api/boards";
import { Column } from "./Column";
import { useAuth } from "../hooks/useAuth";
import { TaskModal } from "./TaskModal";
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { updateTask } from "../api/tasks";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function Board() {
  const { logout, user } = useAuth();
  const [search, setSearch] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [defaultColumnId, setDefaultColumnId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: boards } = useQuery({
    queryKey: ["boards"],
    queryFn: getBoards,
  });

  const boardId = boards?.[0]?.id;

  const { data: columns, isLoading } = useQuery({
    queryKey: ["columns", boardId],
    queryFn: () => (boardId ? getBoardColumns(boardId) : Promise.resolve([])),
    enabled: !!boardId,
  });

  const moveTaskMutation = useMutation({
    mutationFn: ({ taskId, columnId }: { taskId: string; columnId: string }) => 
      updateTask(taskId, { columnId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const overId = over.id;

    let targetColumnId = overId;
    if (over.data.current?.type === 'Task') {
      targetColumnId = over.data.current.task.columnId;
    }

    if (active.data.current?.task.columnId !== targetColumnId) {
      moveTaskMutation.mutate({ taskId, columnId: targetColumnId });
    }
  };

  const openAddModal = (columnId: string) => {
    setDefaultColumnId(columnId);
    setIsAddingTask(true);
  };

  if (isLoading) return <div style={{ padding: "2rem" }}>Loading Project...</div>;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header className="board-header-main">
        <div>
          <h1 className="project-title">{boards?.[0]?.name || "Project Alpha"}</h1>
          <p className="project-subtitle">Main development board for {boards?.[0]?.name || "Project Alpha"}</p>
        </div>
        
        <div className="user-profile">
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="form-input" 
            style={{ width: "240px", marginBottom: 0, marginRight: "1rem" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="user-avatar">
            {user?.email?.charAt(0).toUpperCase() || "A"}
          </div>
          <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{user?.email.split('@')[0]}</span>
          <button onClick={logout} className="btn btn-ghost" style={{ marginLeft: "1rem" }}>Logout</button>
        </div>
      </header>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="board-container">
          {columns?.sort((a, b) => a.order - b.order).map((column) => (
            <Column 
              key={column.id} 
              column={column} 
              search={search} 
              onAddTask={() => openAddModal(column.id)}
            />
          ))}
        </div>
      </DndContext>

      {isAddingTask && (
        <TaskModal 
          onClose={() => setIsAddingTask(false)} 
          initialColumnId={defaultColumnId || undefined}
        />
      )}
    </div>
  );
}
