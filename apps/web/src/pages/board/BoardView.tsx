import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    closestCenter,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
    DropAnimation,
    rectIntersection
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { keepPreviousData } from "@tanstack/react-query";
import { client } from "@/api/client";
import { Board, Column, Task } from "@/types";
import { BoardColumn } from "@/components/board/BoardColumn";
import { TaskCard } from "@/components/board/TaskCard";
import { TaskDetailDialog } from "@/components/board/TaskDetailDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Sparkles, LayoutGrid, Loader2, Search, Filter, X, Zap, AlertCircle, Flag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export function BoardView() {
    const { boardId } = useParams();
    const queryClient = useQueryClient();
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Dialog states
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [currentColumnId, setCurrentColumnId] = useState<string | null>(null);

    // Form states
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>("medium");
    const [newColumnName, setNewColumnName] = useState("");

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px movement before drag starts
            },
        })
    );

    const { data: board, isLoading } = useQuery({
        queryKey: ["board", boardId],
        queryFn: async () => {
            const res = await client.get<{ board: Board }>(`/boards/${boardId}`);
            return res.data.board;
        },
        enabled: !!boardId,
        placeholderData: keepPreviousData, // Keep showing previous data during refetch
    });

    // Filter tasks based on search and priority
    const filterTasks = (tasks: Task[]): Task[] => {
        return tasks.filter(task => {
            // Search filter - check title and description
            const matchesSearch = searchQuery === '' ||
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchQuery.toLowerCase());

            // Priority filter
            const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

            return matchesSearch && matchesPriority;
        });
    };

    // Check if any filters are active
    const hasActiveFilters = searchQuery !== '' || priorityFilter !== 'all';

    // Mutations
    const createColumnMutation = useMutation({
        mutationFn: async (name: string) => {
            await client.post(`/boards/${boardId}/columns`, { name });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["board", boardId] });
            setIsColumnModalOpen(false);
            setNewColumnName("");
            toast.success("Column created successfully");
        },
        onError: () => {
            toast.error("Failed to create column");
        }
    });

    const createTaskMutation = useMutation({
        mutationFn: async ({ columnId, title }: { columnId: string, title: string }) => {
            await client.post(`/columns/${columnId}/tasks`, {
                title,
                description: newTaskDescription,
                priority: newTaskPriority
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["board", boardId] });
            setIsTaskModalOpen(false);
            setNewTaskTitle("");
            setNewTaskDescription("");
            setNewTaskPriority("medium");
            toast.success("Task created successfully");
        },
        onError: () => {
            toast.error("Failed to create task");
        }
    });

    const moveTaskMutation = useMutation({
        mutationFn: async ({
            taskId,
            columnId,
            position
        }: { taskId: string, columnId: string, position: number }) => {
            await client.patch(`/tasks/${taskId}`, { columnId, position });
        },
        onMutate: async () => {
            // Cancel any outgoing refetches so they don't overwrite our optimistic update
            await queryClient.cancelQueries({ queryKey: ["board", boardId] });
            // Snapshot the previous value
            const previousBoard = queryClient.getQueryData(["board", boardId]);
            return { previousBoard };
        },
        onError: (_err, _vars, context) => {
            // Rollback to the previous value
            if (context?.previousBoard) {
                queryClient.setQueryData(["board", boardId], context.previousBoard);
            }
            toast.error("Failed to move task");
        },
        onSettled: () => {
            // Always refetch after error or success to sync with server
            queryClient.invalidateQueries({ queryKey: ["board", boardId] });
        }
    });

    const moveColumnMutation = useMutation({
        mutationFn: async ({ columnId, position }: { columnId: string, position: number }) => {
            await client.patch(`/columns/${columnId}`, { position });
        },
        onMutate: async () => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["board", boardId] });
            // Snapshot the previous value
            const previousBoard = queryClient.getQueryData(["board", boardId]);
            return { previousBoard };
        },
        onError: (_err, _vars, context) => {
            // Rollback to the previous value
            if (context?.previousBoard) {
                queryClient.setQueryData(["board", boardId], context.previousBoard);
            }
            toast.error("Failed to move column");
        },
        onSettled: () => {
            // Always refetch after error or success
            queryClient.invalidateQueries({ queryKey: ["board", boardId] });
        }
    });

    const deleteColumnMutation = useMutation({
        mutationFn: async (columnId: string) => {
            await client.delete(`/columns/${columnId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["board", boardId] });
            toast.success("Column deleted");
        },
        onError: () => {
            toast.error("Failed to delete column");
        }
    });

    const updateColumnMutation = useMutation({
        mutationFn: async ({ columnId, name }: { columnId: string, name: string }) => {
            await client.patch(`/columns/${columnId}`, { name });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["board", boardId] });
            toast.success("Column updated");
        },
        onError: () => {
            toast.error("Failed to update column");
        }
    });

    // Dnd Handlers
    const onDragStart = (event: DragStartEvent) => {
        setIsDragging(true);
        if (event.active.data.current?.type === "Column") {
            setActiveColumn(event.active.data.current.column);
            return;
        }

        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task);
            return;
        }
    };

    const onDragEnd = (event: DragEndEvent) => {
        setIsDragging(false);
        setActiveColumn(null);
        setActiveTask(null);

        const { active, over } = event;
        if (!over || !board) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const columns = board.columns || [];

        // Handling Column Drag
        if (active.data.current?.type === "Column") {
            const activeIndex = columns.findIndex(col => col.id === activeId);
            const overIndex = columns.findIndex(col => col.id === overId);

            if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
                const newColumns = arrayMove(columns, activeIndex, overIndex);
                queryClient.setQueryData(["board", boardId], { ...board, columns: newColumns });
                moveColumnMutation.mutate({ columnId: activeId as string, position: overIndex });
            }
            return;
        }

        // Handling Task Drag - find where task should go
        if (active.data.current?.type === "Task") {
            const activeTask = active.data.current.task as Task;
            let targetColumnId = activeTask.columnId;
            let targetPosition = 0;

            if (over.data.current?.type === "Task") {
                const overTask = over.data.current.task as Task;
                targetColumnId = overTask.columnId;
                const targetCol = columns.find(c => c.id === targetColumnId);
                if (targetCol?.tasks) {
                    targetPosition = targetCol.tasks.findIndex(t => t.id === overId);
                    if (targetPosition === -1) targetPosition = targetCol.tasks.length;
                }
            } else if (over.data.current?.type === "Column") {
                targetColumnId = overId as string;
                const targetCol = columns.find(c => c.id === targetColumnId);
                targetPosition = targetCol?.tasks?.length || 0;
            }

            if (targetColumnId) {
                moveTaskMutation.mutate({
                    taskId: activeId as string,
                    columnId: targetColumnId,
                    position: targetPosition
                });
            }
        }
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over || !board) return;

        const activeId = active.id;
        const overId = over.id;
        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";
        const isOverColumn = over.data.current?.type === "Column";

        if (!isActiveTask) return;

        const columns = board.columns || [];
        const activeTask = active.data.current?.task as Task;
        const sourceColumnIndex = columns.findIndex(col => col.tasks?.some(t => t.id === activeId));
        if (sourceColumnIndex === -1) return;

        let targetColumnIndex = -1;
        if (isOverTask) {
            targetColumnIndex = columns.findIndex(col => col.tasks?.some(t => t.id === overId));
        } else if (isOverColumn) {
            targetColumnIndex = columns.findIndex(col => col.id === overId);
        }
        if (targetColumnIndex === -1) return;

        const sourceColumn = columns[sourceColumnIndex];
        const targetColumn = columns[targetColumnIndex];
        const sourceTasks = sourceColumn.tasks || [];
        const targetTasks = targetColumn.tasks || [];

        const activeTaskIndex = sourceTasks.findIndex(t => t.id === activeId);
        if (activeTaskIndex === -1) return;

        // Same column reordering
        if (sourceColumnIndex === targetColumnIndex && isOverTask) {
            const overTaskIndex = targetTasks.findIndex(t => t.id === overId);
            if (activeTaskIndex !== overTaskIndex && overTaskIndex !== -1) {
                const reorderedTasks = arrayMove(sourceTasks, activeTaskIndex, overTaskIndex);
                const newColumns = columns.map((col, i) =>
                    i === sourceColumnIndex ? { ...col, tasks: reorderedTasks } : col
                );
                queryClient.setQueryData(["board", boardId], { ...board, columns: newColumns });
            }
            return;
        }

        // Moving to different column
        if (sourceColumnIndex !== targetColumnIndex) {
            const taskToMove = { ...activeTask, columnId: targetColumn.id };
            const newSourceTasks = sourceTasks.filter(t => t.id !== activeId);

            let insertIndex = targetTasks.length;
            if (isOverTask) {
                const overIdx = targetTasks.findIndex(t => t.id === overId);
                if (overIdx !== -1) insertIndex = overIdx;
            }

            const newTargetTasks = [
                ...targetTasks.slice(0, insertIndex),
                taskToMove,
                ...targetTasks.slice(insertIndex)
            ];

            const newColumns = columns.map((col, i) => {
                if (i === sourceColumnIndex) return { ...col, tasks: newSourceTasks };
                if (i === targetColumnIndex) return { ...col, tasks: newTargetTasks };
                return col;
            });

            queryClient.setQueryData(["board", boardId], { ...board, columns: newColumns });
        }
    };

    // Action Handlers
    const handleAddTask = (columnId: string) => {
        setCurrentColumnId(columnId);
        setIsTaskModalOpen(true);
    };

    const handleCreateTask = () => {
        if (currentColumnId && newTaskTitle.trim()) {
            createTaskMutation.mutate({
                columnId: currentColumnId,
                title: newTaskTitle
            })
        }
    }

    const handleTaskClick = (task: Task) => {
        setSelectedTaskId(task.id);
        setIsDetailOpen(true);
    }

    if (isLoading) return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            {/* Header skeleton */}
            <div className="mb-5 pb-4 border-b border-border/40 flex justify-between items-center">
                <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <Skeleton className="h-7 w-48 rounded-md" />
                    </div>
                    <Skeleton className="h-3 w-20 ml-11 rounded" />
                </div>
                <Skeleton className="h-9 w-28 rounded-md" />
            </div>
            {/* Columns skeleton */}
            <div className="flex-1 flex gap-3 overflow-hidden">
                {[1, 2, 3].map((colIndex) => (
                    <div key={colIndex} className="w-[300px] flex-shrink-0 flex flex-col gap-2.5">
                        {/* Column header */}
                        <Skeleton className="h-[64px] w-full rounded-lg" />
                        {/* Tasks container */}
                        <div className="flex-1 flex flex-col gap-2.5 bg-muted/10 rounded-lg p-2.5 border border-border/20">
                            {/* Task card skeletons */}
                            {[1, 2, 3].slice(0, colIndex === 2 ? 3 : 2).map((taskIndex) => (
                                <div key={taskIndex} className="bg-card rounded-lg border border-border/30 p-3 space-y-2">
                                    <Skeleton className="h-4 w-full rounded" />
                                    <Skeleton className="h-4 w-3/4 rounded" />
                                    <div className="flex gap-2 pt-1">
                                        <Skeleton className="h-6 w-16 rounded-md" />
                                        <Skeleton className="h-6 w-8 rounded-md" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
    if (!board) return <div className="p-8">Board not found</div>;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
        >
            <div className="h-[calc(100vh-8rem)] flex flex-col">
                {/* Header with search and filters inline */}
                <div className="mb-4 pb-4 border-b border-border/40">
                    <div className="flex items-center gap-4">
                        {/* Project name - left */}
                        <div className="space-y-0.5 flex-shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-lg shadow-sm">
                                    <LayoutGrid className="w-4 h-4 text-white" />
                                </div>
                                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                    {board.name}
                                </h1>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium ml-11">
                                {board.columns?.length ?? 0} {(board.columns?.length ?? 0) === 1 ? 'column' : 'columns'}
                            </p>
                        </div>

                        {/* Search and Filters - center/fill */}
                        <div className="flex-1 flex items-center gap-3 justify-center">
                            {/* Search Input */}
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search tasks..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-8 bg-muted/30 border-border/50 focus:bg-background text-sm"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted transition-colors"
                                    >
                                        <X className="h-3 w-3 text-muted-foreground" />
                                    </button>
                                )}
                            </div>

                            {/* Priority Filter Buttons */}
                            <div className="flex items-center gap-1">
                                <Filter className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                                {(['all', 'high', 'medium', 'low'] as const).map((priority) => (
                                    <button
                                        key={priority}
                                        onClick={() => setPriorityFilter(priority)}
                                        className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${priorityFilter === priority
                                            ? priority === 'all'
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : priority === 'high'
                                                    ? 'bg-[hsl(var(--priority-high))] text-white shadow-sm'
                                                    : priority === 'medium'
                                                        ? 'bg-[hsl(var(--priority-medium))] text-white shadow-sm'
                                                        : 'bg-[hsl(var(--priority-low))] text-white shadow-sm'
                                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                                            }`}
                                    >
                                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                    </button>
                                ))}
                            </div>

                            {/* Clear Filters */}
                            {hasActiveFilters && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setPriorityFilter('all');
                                    }}
                                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                >
                                    <X className="h-3 w-3" />
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Add Column - right */}
                        <Button
                            onClick={() => setIsColumnModalOpen(true)}
                            className="h-9 px-4 shadow-sm hover:shadow-md transition-all font-semibold text-sm flex-shrink-0"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Column
                        </Button>
                    </div>
                </div>

                {/* Board columns with improved scrolling */}
                <div className="flex-1 overflow-x-auto overflow-y-hidden pb-3 -mx-1 px-1 custom-scrollbar">
                    <div className="flex h-full gap-3 min-w-full">
                        <SortableContext items={(board.columns || []).map(col => col.id)} strategy={horizontalListSortingStrategy}>
                            {(board.columns || []).map((col) => (
                                <BoardColumn
                                    key={col.id}
                                    column={col}
                                    tasks={filterTasks(col.tasks || [])}
                                    onAddTask={handleAddTask}
                                    onTaskClick={handleTaskClick}
                                    onDeleteColumn={(id) => deleteColumnMutation.mutate(id)}
                                    onUpdateColumn={(id, name) => updateColumnMutation.mutate({ columnId: id, name })}
                                />
                            ))}
                        </SortableContext>

                        {/* Add column placeholder - always hide during any drag operation */}
                        {!isDragging && (board.columns?.length ?? 0) === 0 && (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center space-y-5 max-w-md">
                                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center shadow-sm">
                                        <Sparkles className="w-8 h-8 text-primary/60" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-lg">No columns yet</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            Get started by adding your first column to organize tasks and workflows
                                        </p>
                                    </div>
                                    <Button onClick={() => setIsColumnModalOpen(true)} className="shadow-sm hover:shadow-md transition-all font-semibold text-sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Column
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeColumn && (
                    <BoardColumn
                        column={activeColumn}
                        tasks={activeColumn.tasks || []}
                        onAddTask={() => { }}
                        onTaskClick={() => { }}
                        onDeleteColumn={() => { }}
                        onUpdateColumn={() => { }}
                    />
                )}
                {activeTask && (
                    <TaskCard task={activeTask} />
                )}
            </DragOverlay>

            <TaskDetailDialog
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                taskId={selectedTaskId}
            />

            {/* Create Task Dialog */}
            <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
                <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
                    <DialogHeader className="px-5 py-4 border-b border-border/50 bg-muted/20">
                        <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                            <Plus className="w-5 h-5 text-primary" />
                            Add New Task
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-5 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="taskTitle" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Task Title <span className="text-destructive">*</span></Label>
                            <Input
                                id="taskTitle"
                                value={newTaskTitle}
                                onChange={e => setNewTaskTitle(e.target.value)}
                                placeholder="What needs to be done?"
                                className="h-10 border-input/60 focus:border-primary/50 font-medium"
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="taskPriority" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority</Label>
                                <div className="flex bg-muted/40 p-1 rounded-lg border border-border/40">
                                    {(['low', 'medium', 'high'] as const).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setNewTaskPriority(p)}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${newTaskPriority === p
                                                ? 'bg-background shadow-sm text-foreground ring-1 ring-border/50'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                                }`}
                                            type="button"
                                        >
                                            {p === 'high' && <Zap className="w-3 h-3 text-[hsl(var(--priority-high))]" />}
                                            {p === 'medium' && <AlertCircle className="w-3 h-3 text-[hsl(var(--priority-medium))]" />}
                                            {p === 'low' && <Flag className="w-3 h-3 text-[hsl(var(--priority-low))]" />}
                                            {p.charAt(0).toUpperCase() + p.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="taskDesc" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</Label>
                            <textarea
                                id="taskDesc"
                                value={newTaskDescription}
                                onChange={e => setNewTaskDescription(e.target.value)}
                                placeholder="Add details..."
                                className="flex min-h-[80px] w-full rounded-md border border-input/60 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary/50 transition-smooth resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter className="px-5 py-3 border-t border-border/50 bg-muted/20">
                        <Button variant="ghost" onClick={() => setIsTaskModalOpen(false)} className="h-9">Cancel</Button>
                        <Button
                            onClick={handleCreateTask}
                            disabled={!newTaskTitle.trim() || createTaskMutation.isPending}
                            className="h-9 shadow-sm"
                        >
                            {createTaskMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                            Create Task
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Column Dialog */}
            <Dialog open={isColumnModalOpen} onOpenChange={setIsColumnModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Column</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="colName">Column Name</Label>
                        <Input
                            id="colName"
                            value={newColumnName}
                            onChange={e => setNewColumnName(e.target.value)}
                            placeholder="e.g. In Progress"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={() => createColumnMutation.mutate(newColumnName)}
                            disabled={!newColumnName.trim() || createColumnMutation.isPending}
                        >
                            Create Column
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </DndContext>
    );
}

const dropAnimation: DropAnimation = {
    duration: 150, // Reduced for snappier feel
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)', // Smoother magnetic snap
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: "0.5",
            },
        },
    }),
};
