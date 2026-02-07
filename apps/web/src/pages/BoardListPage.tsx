"use client";

import React from "react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FiLogOut,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiColumns,
  FiCheckSquare,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { getBoards, createBoard, deleteBoard, updateBoard } from "../lib/api";
import { BoardView } from "../components/BoardView";
import { Spinner } from "../components/Spinner";
import { ConfirmModal } from "../components/ConfirmModal";

interface Board {
  id: string;
  title: string;
  columns?: any[];
}

export function BoardListPage() {
  const { user, token, logout } = useAuth();
  const queryClient = useQueryClient();
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingBoardTitle, setEditingBoardTitle] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data: boardsData, isLoading } = useQuery({
    queryKey: ["boards"],
    queryFn: async () => {
      if (!token) throw new Error("No token");
      const response = await getBoards(token);
      return response.boards;
    },
    enabled: !!token,
  });

  const boards: Board[] = boardsData || [];
  const selectedBoard = boards.find((b) => b.id === selectedBoardId);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newBoardTitle.trim()) {
      toast.error("Board name cannot be empty");
      return;
    }

    setIsCreating(true);
    try {
      await createBoard(newBoardTitle, token);
      setNewBoardTitle("");
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      toast.success("Board created");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create board",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditBoard = async (boardId: string, newTitle: string) => {
    if (!token) return;

    if (!newTitle.trim()) {
      toast.error("Board name cannot be empty");
      return;
    }

    const board = boards.find((b) => b.id === boardId);
    if (!board) return;

    // Only update if title actually changed
    if (newTitle.trim() === board.title) {
      setEditingBoardId(null);
      return;
    }

    try {
      await updateBoard(boardId, newTitle, token);
      setEditingBoardId(null);
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      toast.success("Board updated");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update board",
      );
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    if (!token) return;

    try {
      await deleteBoard(boardId, token);
      if (selectedBoardId === boardId) {
        setSelectedBoardId(null);
      }
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      toast.success("Board deleted");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete board",
      );
    } finally {
      setDeleteConfirmId(null);
    }
  };

  if (selectedBoard) {
    return (
      <BoardView
        boardId={selectedBoard.id}
        boardTitle={selectedBoard.title}
        onBack={() => setSelectedBoardId(null)}
      />
    );
  }

  const handleBoardClick = (boardId: string) => {
    setSelectedBoardId(boardId);
  };

  const calculateBoardStats = (board: Board) => {
    const columns = board.columns || [];
    const tasks = columns.reduce(
      (sum, col) => sum + (col.tasks?.length || 0),
      0,
    );
    return { columns: columns?.length, tasks };
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <header className="bg-bg-secondary border-b border-border p-lg flex justify-between items-center">
        <div className="flex items-center gap-md">
          <h1 className="text-2xl font-bold text-black m-0 flex items-center gap-sm">
            <FiColumns size={28} />
            Team Boards
          </h1>
        </div>
        <div className="flex items-center gap-md">
          <span className="text-sm text-text-secondary">{user?.name}</span>
          <button
            onClick={logout}
            className="px-md py-sm bg-danger text-white border-none rounded-md cursor-pointer font-medium text-sm transition-all flex items-center gap-sm hover:bg-red-700"
          >
            <FiLogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 p-xl overflow-auto">
        <section className="mb-xl">
          <h2 className="text-xl font-semibold text-text-primary mb-lg flex items-center gap-md">
            <FiPlus size={20} />
            Create New Board
          </h2>
          <form
            onSubmit={handleCreateBoard}
            className="flex gap-md mb-xl max-w-md"
          >
            <input
              type="text"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              placeholder="Enter board name..."
              disabled={isCreating}
              className="flex-1 px-md py-sm bg-bg-secondary text-text-primary border border-border rounded-md text-sm transition-all focus:border-primary"
            />
            <button
              type="submit"
              disabled={isCreating}
              className={`px-lg py-sm bg-primary text-white border-none rounded-md cursor-pointer font-medium text-sm flex items-center gap-sm transition-all ${
                isCreating ? "opacity-60" : "opacity-100 hover:bg-primary-dark"
              }`}
            >
              {isCreating ? "Creating..." : "Create"}
            </button>
          </form>
        </section>

        <section className="mb-xl">
          <h2 className="text-xl font-semibold text-text-primary mb-lg flex items-center gap-md">
            <FiColumns size={20} />
            Your Boards
          </h2>

          {isLoading ? (
            <Spinner />
          ) : boards?.length === 0 ? (
            <div className="text-center p-xl text-text-muted">
              <div className="text-5xl mb-md">📭</div>
              <p>No boards yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-lg">
              {boards.map((board) => {
                const stats = calculateBoardStats(board);
                const isEditing = editingBoardId === board.id;

                return (
                  <div
                    key={board.id}
                    className="bg-bg-secondary border border-border rounded-lg p-lg cursor-pointer transition-all flex flex-col gap-md hover:border-primary hover:shadow-lg"
                  >
                    {isEditing ? (
                      <input
                        autoFocus
                        type="text"
                        value={editingBoardTitle}
                        onChange={(e) => setEditingBoardTitle(e.target.value)}
                        className="flex-1 px-md py-sm bg-bg-secondary text-text-primary border border-border rounded-md text-sm transition-all focus:border-primary"
                        onBlur={() => {
                          if (editingBoardTitle.trim()) {
                            handleEditBoard(board.id, editingBoardTitle);
                          }
                          setEditingBoardId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (editingBoardTitle.trim()) {
                              handleEditBoard(board.id, editingBoardTitle);
                            }
                            setEditingBoardId(null);
                          } else if (e.key === "Escape") {
                            setEditingBoardId(null);
                          }
                        }}
                      />
                    ) : (
                      <>
                        <h3
                          className="text-base font-semibold text-text-primary m-0 cursor-pointer"
                          onClick={() => handleBoardClick(board.id)}
                        >
                          {board.title}
                        </h3>
                        <div className="flex gap-md text-xs text-text-secondary">
                          <div className="flex items-center gap-xs">
                            <FiColumns size={14} />
                            {stats.columns} column
                            {stats.columns !== 1 ? "s" : ""}
                          </div>
                          <div className="flex items-center gap-xs">
                            <FiCheckSquare size={14} />
                            {stats.tasks} task{stats.tasks !== 1 ? "s" : ""}
                          </div>
                        </div>
                        <div className="flex gap-sm justify-end pt-md border-t border-border">
                          <button
                            className="px-xs py-xs bg-transparent text-primary border-none rounded-md cursor-pointer text-base transition-all hover:bg-bg-tertiary"
                            onClick={() => {
                              setEditingBoardId(board.id);
                              setEditingBoardTitle(board.title);
                            }}
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            className="px-xs py-xs bg-transparent text-danger border-none rounded-md cursor-pointer text-base transition-all hover:bg-bg-tertiary"
                            onClick={() => {
                              setDeleteConfirmId(board.id);
                            }}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {deleteConfirmId && (
        <ConfirmModal
          isOpen={true}
          title="Delete Board"
          message="Are you sure you want to delete this board? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          isDangerous={true}
          onConfirm={() => {
            handleDeleteBoard(deleteConfirmId);
          }}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}
    </div>
  );
}
