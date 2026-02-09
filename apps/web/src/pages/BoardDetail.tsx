import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { KanbanColumn } from '@/components/kanban/KanbanColumn';
import { TaskCard } from '@/components/kanban/TaskCard';
import { TaskModal } from '@/components/kanban/TaskModal';
import { CommentsDrawer } from '@/components/kanban/CommentsDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ColumnSkeleton } from '@/components/ui/skeleton-loader';
import { boardsApi, columnsApi, tasksApi } from '@/services/api';
import type { Board, Column, Task } from '@/types';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export const BoardDetailPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();

  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Drag state
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Modals
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);

  const [columnToEdit, setColumnToEdit] = useState<Column | null>(null);
  const [editColumnTitle, setEditColumnTitle] = useState('');

  const [columnToDelete, setColumnToDelete] = useState<Column | null>(null);
  const [isDeletingColumn, setIsDeletingColumn] = useState(false);

  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);

  const [taskForComments, setTaskForComments] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchBoard = useCallback(async () => {
    if (!boardId) return;

    try {
      const data = await boardsApi.getById(boardId);
      setBoard(data);
      setColumns(data.columns || []);

      // Flatten tasks from all columns
      const allTasks: Task[] = [];
      data.columns?.forEach((col) => {
        col.tasks?.forEach((task) => {
          allTasks.push(task);
        });
      });
      setTasks(allTasks);
    } catch (error) {
      toast.error('Failed to load board');
      navigate('/boards');
    } finally {
      setIsLoading(false);
    }
  }, [boardId, navigate]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  // Column handlers
  const handleAddColumn = async () => {
    if (!boardId || !newColumnTitle.trim()) return;

    setIsCreatingColumn(true);
    try {
      const column = await columnsApi.create(boardId, {
        title: newColumnTitle.trim(),
        position: columns.length,
      });
      setColumns([...columns, column]);
      setNewColumnTitle('');
      setIsAddColumnOpen(false);
      toast.success('Column created');
    } catch (error) {
      toast.error('Failed to create column');
    } finally {
      setIsCreatingColumn(false);
    }
  };

  const handleEditColumn = async () => {
    if (!boardId || !columnToEdit || !editColumnTitle.trim()) return;

    try {
      const updated = await columnsApi.update(columnToEdit.id, {
        title: editColumnTitle.trim(),
      });
      setColumns(columns.map((c) => (c.id === updated.id ? updated : c)));
      setColumnToEdit(null);
      toast.success('Column updated');
    } catch (error) {
      toast.error('Failed to update column');
    }
  };

  const handleDeleteColumn = async () => {
    if (!boardId || !columnToDelete) return;

    setIsDeletingColumn(true);
    try {
      await columnsApi.delete(columnToDelete.id);
      setColumns(columns.filter((c) => c.id !== columnToDelete.id));
      setTasks(tasks.filter((t) => t.columnId !== columnToDelete.id));
      setColumnToDelete(null);
      toast.success('Column deleted');
    } catch (error) {
      toast.error('Failed to delete column');
    } finally {
      setIsDeletingColumn(false);
    }
  };

  // Task handlers
  const handleAddTask = async (columnId: string, title: string) => {
    try {
      const columnTasks = tasks.filter((t) => t.columnId === columnId);
      const task = await tasksApi.create(columnId, {
        title,
        order: columnTasks.length,
      });
      setTasks([...tasks, task]);
      toast.success('Task created');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId: string, data: { title: string; description?: string }) => {
    try {
      const updated = await tasksApi.update(taskId, data);
      setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
      setTaskToEdit(null);
      toast.success('Task updated');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    setIsDeletingTask(true);
    try {
      await tasksApi.delete(taskToDelete.id);
      setTasks(tasks.filter((t) => t.id !== taskToDelete.id));
      setTaskToDelete(null);
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    } finally {
      setIsDeletingTask(false);
    }
  };

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if we're over a column
    const overColumn = columns.find((c) => c.id === overId);
    if (overColumn && activeTask.columnId !== overId) {
      // Move to new column
      setTasks(
        tasks.map((t) =>
          t.id === activeId ? { ...t, columnId: overId } : t
        )
      );
    }

    // Check if we're over a task
    const overTask = tasks.find((t) => t.id === overId);
    if (overTask && activeTask.columnId !== overTask.columnId) {
      // Move to the column of the task we're over
      setTasks(
        tasks.map((t) =>
          t.id === activeId ? { ...t, columnId: overTask.columnId } : t
        )
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Determine target column
    let targetColumnId = activeTask.columnId;
    const overColumn = columns.find((c) => c.id === overId);
    const overTask = tasks.find((t) => t.id === overId);

    if (overColumn) {
      targetColumnId = overColumn.id;
    } else if (overTask) {
      targetColumnId = overTask.columnId;
    }

    // Calculate new order
    const columnTasks = tasks
      .filter((t) => t.columnId === targetColumnId && t.id !== activeId)
      .sort((a, b) => a.order - b.order);

    let newOrder = 0;
    if (overTask && overTask.columnId === targetColumnId) {
      const overIndex = columnTasks.findIndex((t) => t.id === overId);
      newOrder = overIndex >= 0 ? overIndex : columnTasks.length;
    } else {
      newOrder = columnTasks.length;
    }

    // Update locally first for responsiveness
    setTasks(
      tasks.map((t) =>
        t.id === activeId ? { ...t, columnId: targetColumnId, order: newOrder } : t
      )
    );

    // Sync with server
    try {
      await tasksApi.update(activeId, { columnId: targetColumnId, order: newOrder });
    } catch (error) {
      toast.error('Failed to move task');
      fetchBoard(); // Revert on error
    }
  };

  const getTasksForColumn = (columnId: string) => {
    return tasks.filter((t) => t.columnId === columnId);
  };

  const sortedColumns = [...columns].sort((a, b) => (a.position ?? a.order ?? 0) - (b.position ?? b.order ?? 0));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/boards">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              {isLoading ? (
                <div className="h-8 w-48 skeleton-pulse rounded" />
              ) : (
                <div>
                  <h1 className="text-xl font-bold text-foreground">{board?.name}</h1>
                  
                </div>
              )}
            </div>

            <Button onClick={() => setIsAddColumnOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Column
            </Button>
          </div>
        </div>
      </div>

      <main className="container flex-1 py-6 overflow-x-auto">
        <div className="p-6 min-h-full">
          {isLoading ? (
            <div className="flex gap-4">
              {[...Array(3)].map((_, i) => (
                <ColumnSkeleton key={i} />
              ))}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="flex gap-4">
                {sortedColumns.map((column) => (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    tasks={getTasksForColumn(column.id)}
                    onEditColumn={(c) => {
                      setColumnToEdit(c);
                      setEditColumnTitle(c.title);
                    }}
                    onDeleteColumn={setColumnToDelete}
                    onAddTask={handleAddTask}
                    onEditTask={setTaskToEdit}
                    onDeleteTask={setTaskToDelete}
                    onViewComments={setTaskForComments}
                  />
                ))}

                {columns.length === 0 && (
                  <div className="flex items-center justify-center w-full py-20">
                    <div className="text-center">
                      <p className="text-muted-foreground mb-4">
                        No columns yet. Create your first column to get started.
                      </p>
                      <Button onClick={() => setIsAddColumnOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Column
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <DragOverlay>
                {activeTask && (
                  <div className="w-64">
                    <TaskCard
                      task={activeTask}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      onViewComments={() => {}}
                      isDragging
                    />
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </main>

      {/* Add Column Dialog */}
      <Dialog open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Column</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="columnTitle">Column Title</Label>
              <Input
                id="columnTitle"
                placeholder="e.g., To Do, In Progress, Done"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                className="focus-ring"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddColumnOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddColumn} disabled={isCreatingColumn || !newColumnTitle.trim()}>
              {isCreatingColumn && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Column
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Column Dialog */}
      <Dialog open={!!columnToEdit} onOpenChange={() => setColumnToEdit(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Column</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editColumnTitle">Column Title</Label>
              <Input
                id="editColumnTitle"
                value={editColumnTitle}
                onChange={(e) => setEditColumnTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEditColumn()}
                className="focus-ring"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setColumnToEdit(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditColumn} disabled={!editColumnTitle.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Column Dialog */}
      <AlertDialog open={!!columnToDelete} onOpenChange={() => setColumnToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Column</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{columnToDelete?.title}"? All tasks in this column
              will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingColumn}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteColumn}
              disabled={isDeletingColumn}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingColumn ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Task Modal */}
      <TaskModal
        task={taskToEdit}
        isOpen={!!taskToEdit}
        onClose={() => setTaskToEdit(null)}
        onSave={handleUpdateTask}
      />

      {/* Delete Task Dialog */}
      <AlertDialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{taskToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingTask}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              disabled={isDeletingTask}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingTask ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Comments Drawer */}
      <CommentsDrawer
        task={taskForComments}
        isOpen={!!taskForComments}
        onClose={() => setTaskForComments(null)}
      />
    </div>
  );
};

export default BoardDetailPage;
