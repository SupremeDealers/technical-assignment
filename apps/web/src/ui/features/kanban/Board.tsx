import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task, apiFetch } from "../../../core/api";
import { useAuth } from "../../../core/AuthContext";
import { Column } from "./Column";
import { TaskModal } from "./TaskModal";

export const Board = () => {
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    data: tasksData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tasks", debouncedSearch],
    queryFn: () =>
      apiFetch(`/tasks?search=${encodeURIComponent(debouncedSearch)}`),
  });

  const addTask = useMutation({
    mutationFn: (status: string) =>
      apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({ title: "New Task", status }),
      }),
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setSelectedTask(newTask);
      setIsModalOpen(true);
    },
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[80vh] text-lg opacity-50 bg-background-light text-primary font-bold uppercase tracking-[0.2em]">
        Synchronizing...
      </div>
    );
  if (error)
    return (
      <div className="text-center p-20 text-red-500 bg-background-light border-strict m-8">
        <span className="material-symbols-outlined text-4xl mb-4">error</span>
        <p className="text-xs font-bold tracking-widest uppercase">
          System Error: {(error as Error).message}
        </p>
      </div>
    );

  const tasks = tasksData?.tasks || [];

  return (
    <div className="bg-background-light min-h-screen text-primary pb-20">
      {/* Top Navigation Bar */}
      <header className="border-b border-primary px-8 h-16 flex items-center justify-between bg-white sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">
              architecture
            </span>
            <h1 className="text-xl font-bold tracking-tighter uppercase leading-none">
              Kanban
            </h1>
          </div>
          <div className="h-8 w-px bg-primary mx-2 hidden md:block"></div>
          {/* 
          <div className="hidden md:flex gap-6 items-center">
            <a
              className="text-xs font-bold tracking-[0.2em] hover:underline uppercase"
              href="#"
            >
              Projects
            </a>
            <div className="h-3 w-px bg-primary"></div>
            <a
              className="text-xs font-bold tracking-[0.2em] hover:underline uppercase"
              href="#"
            >
              Team
            </a>
            <div className="h-3 w-px bg-primary"></div>
            <a
              className="text-xs font-bold tracking-[0.2em] hover:underline uppercase"
              href="#"
            >
              Settings
            </a>
          </div>
          */}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative border-strict flex items-center bg-white">
            <span className="material-symbols-outlined absolute left-2 pointer-events-none opacity-40">
              search
            </span>
            <input
              type="text"
              placeholder="SEARCH PROTOCOLS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent pl-10 pr-4 h-10 text-[10px] font-bold tracking-[0.15em] outline-none w-48 focus:w-64 transition-all duration-300"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="border-strict p-2 hover-invert transition-colors duration-100 flex items-center justify-center"
            >
              <span className="material-symbols-outlined">account_circle</span>
            </button>
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border-strict z-50 p-4 shadow-xl">
                <p className="text-[10px] font-bold tracking-widest uppercase opacity-40 mb-2">
                  Connected as
                </p>
                <p className="text-sm font-bold mb-4 truncate">
                  {user?.username}
                </p>
                <button
                  onClick={logout}
                  className="w-full border-strict p-2 text-[10px] font-bold tracking-widest uppercase hover-invert transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined !text-sm">
                    logout
                  </span>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="p-8">
        {/* Dashboard Header */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] mb-1 font-bold">
              Active Workspace
            </p>
            <h2 className="text-3xl font-light tracking-tight truncate max-w-xl">
              Project Roadmap{" "}
              <span className="text-sm border-strict px-2 py-0.5 ml-2 align-middle font-bold">
                PRO-24
              </span>
            </h2>
          </div>
          <button
            onClick={() => addTask.mutate("todo")}
            className="border-strict px-6 h-12 flex items-center gap-3 hover-invert transition-colors duration-100"
          >
            <span className="material-symbols-outlined">add</span>
            <span className="text-xs font-bold tracking-[0.15em] uppercase">
              New Task
            </span>
          </button>
        </div>

        {/* Kanban Board Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Column
            title="Backlog"
            status="todo"
            tasks={tasks.filter((t: Task) => t.status === "todo")}
            onAddTask={(s) => addTask.mutate(s)}
            onTaskClick={(t) => {
              setSelectedTask(t);
              setIsModalOpen(true);
            }}
          />
          <Column
            title="In Progress"
            status="in-progress"
            tasks={tasks.filter((t: Task) => t.status === "in-progress")}
            onAddTask={(s) => addTask.mutate(s)}
            onTaskClick={(t) => {
              setSelectedTask(t);
              setIsModalOpen(true);
            }}
          />
          <Column
            title="Done"
            status="done"
            tasks={tasks.filter((t: Task) => t.status === "done")}
            onAddTask={(s) => addTask.mutate(s)}
            onTaskClick={(t) => {
              setSelectedTask(t);
              setIsModalOpen(true);
            }}
          />
        </div>
      </main>

      {/* Project Meta Bar */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-primary bg-white px-8 h-10 flex items-center justify-between text-[10px] font-bold tracking-[0.15em] uppercase z-40">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-black"></div>
            <span>Status: Phase 03 - Development</span>
          </div>
          <div className="flex items-center gap-2 hidden md:flex">
            <span className="material-symbols-outlined !text-[14px]">
              schedule
            </span>
            <span>Last Sync: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
        <div className="flex gap-4">
          <span className="cursor-pointer hover:underline">Support</span>
          <span className="opacity-20">/</span>
          <span className="cursor-pointer hover:underline uppercase">
            V2.4.1
          </span>
        </div>
      </footer>

      <TaskModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
      />
    </div>
  );
};
