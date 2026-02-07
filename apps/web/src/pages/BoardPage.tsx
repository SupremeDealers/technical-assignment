import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { api, type Column, type Task } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { TaskModal } from "../components/TaskModal";
import { CreateTaskModal } from "../components/CreateTaskModal";
import { DroppableColumn } from "../components/DroppableColumn";
import { DraggableTaskCard } from "../components/DraggableTaskCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { NativeSelect } from "../components/ui/native-select";
import { Spinner } from "../components/ui/spinner";
import { Search, Plus, LogOut, Filter } from "lucide-react";
import { toast, Toaster } from "sonner";

const BOARD_ID = 1;

export function BoardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");

  const { data: columns = [], isLoading: columnsLoading } = useQuery({
    queryKey: ["columns", BOARD_ID],
    queryFn: () => api.getBoardColumns(BOARD_ID),
  });

  const { data: tasksData = {}, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const results: Record<number, Task[]> = {};
      for (const column of columns) {
        const response = await api.getColumnTasks(column.id, { limit: 100 });
        results[column.id] = response.tasks;
      }
      return results;
    },
    enabled: columns.length > 0,
  });

  const filteredTasksData = useMemo(() => {
    if (!searchQuery && priorityFilter === "all") return tasksData;
    
    const filtered: Record<number, Task[]> = {};
    Object.entries(tasksData).forEach(([columnId, tasks]) => {
      filtered[Number(columnId)] = tasks.filter(task => {
        const matchesSearch = !searchQuery || 
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
        return matchesSearch && matchesPriority;
      });
    });
    return filtered;
  }, [tasksData, searchQuery, priorityFilter]);

  const moveTaskMutation = useMutation({
    mutationFn: ({ taskId, columnId }: { taskId: number; columnId: number }) =>
      api.updateTask(taskId, { columnId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["columns", BOARD_ID] });
      toast.success("Task moved successfully!");
    },
    onError: () => {
      toast.error("Failed to move task. Please try again.");
    },
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = active.id as number;
    
    for (const columnId in filteredTasksData) {
      const task = filteredTasksData[columnId]?.find((t) => t.id === taskId);
      if (task) {
        setActiveTask(task);
        break;
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as number;
    const newColumnId = over.id as number;

    let currentTask: Task | undefined;
    for (const columnId in filteredTasksData) {
      const task = filteredTasksData[columnId]?.find((t) => t.id === taskId);
      if (task) {
        currentTask = task;
        break;
      }
    }

    if (currentTask && currentTask.columnId !== newColumnId) {
      moveTaskMutation.mutate({ taskId, columnId: newColumnId });
    }
  };

  if (columnsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" className="text-primary" />
          <p className="text-muted-foreground">Loading board...</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Toaster position="bottom-left"  richColors/>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold tracking-tight">Project Board</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Welcome, {user?.name}
              </span>
              <Button onClick={() => setCreateTaskModalOpen(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create Task
              </Button>
              <Button onClick={handleLogout} variant="destructive" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-lg border shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <NativeSelect
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-35"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </NativeSelect>
              </div>
              <NativeSelect
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-[140px]"
              >
                <option value="createdAt">Created Date</option>
                <option value="updatedAt">Updated Date</option>
                <option value="title">Title</option>
                <option value="priority">Priority</option>
              </NativeSelect>
            </div>
          </div>

          {tasksLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Spinner size="md" className="text-primary" />
                <p className="text-sm text-muted-foreground">Loading tasks...</p>
              </div>
            </div>
          )}

          {!tasksLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {columns.map((column) => (
                <DroppableColumn
                  key={column.id}
                  column={column}
                  taskCount={filteredTasksData[column.id]?.length || 0}
                >
                  {filteredTasksData[column.id]?.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                      {searchQuery || priorityFilter !== "all" 
                        ? "No tasks match your filters"
                        : "No tasks in this column"}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredTasksData[column.id]?.map((task) => (
                        <DraggableTaskCard
                          key={task.id}
                          task={task}
                          onSelect={() => setSelectedTask(task)}
                          onEdit={() => setEditTask(task)}
                        />
                      ))}
                    </div>
                  )}
                </DroppableColumn>
              ))}
            </div>
          )}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="bg-card p-4 rounded-lg border-2 border-primary shadow-2xl min-w-[280px] opacity-90">
              <h3 className="text-sm font-semibold">
                {activeTask.title}
              </h3>
            </div>
          ) : null}
        </DragOverlay>
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEdit={() => {
            setEditTask(selectedTask);
            setSelectedTask(null);
          }}
        />
      )}

      {editTask && (
        <CreateTaskModal
          editTask={editTask}
          onClose={() => setEditTask(null)}
        />
      )}

      {createTaskModalOpen && (
        <CreateTaskModal
          onClose={() => setCreateTaskModalOpen(false)}
        />
      )}
    </DndContext>
  );
}
