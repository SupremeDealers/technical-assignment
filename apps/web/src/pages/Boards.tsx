import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Layout } from "../components/Layout";

export function BoardsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["boards"],
    queryFn: api.getBoards,
  });

  const createMutation = useMutation({
    mutationFn: api.createBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      setShowCreate(false);
      setNewBoardName("");
    },
  });

  const handleCreateBoard = (e: FormEvent) => {
    e.preventDefault();
    if (newBoardName.trim()) {
      createMutation.mutate({ name: newBoardName.trim() });
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto w-full px-8 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              My Boards
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Manage your project boards
            </p>
          </div>
          <button
            className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 active:scale-[0.98] shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all cursor-pointer flex items-center gap-2"
            onClick={() => setShowCreate(true)}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Board
          </button>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent mb-4"></div>
            <p className="text-sm font-medium text-slate-600">Loading boards...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-32">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 mb-4 mx-auto">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-lg font-bold text-slate-900 mb-2">
              Error loading boards
            </div>
            <div className="text-sm text-slate-600">
              {error instanceof Error ? error.message : "Unknown error"}
            </div>
          </div>
        )}

        {data && data.boards.length === 0 && (
          <div className="text-center py-32">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center border-2 border-indigo-100 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            </div>
            <div className="text-xl font-bold text-slate-900 mb-2">
              No boards yet
            </div>
            <div className="text-sm text-slate-600 mb-6">
              Create your first board to get started
            </div>
            <button
              className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all cursor-pointer inline-flex items-center gap-2"
              onClick={() => setShowCreate(true)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create your first board
            </button>
          </div>
        )}

        {data && data.boards.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
            {data.boards.map((board) => (
              <Link
                key={board.id}
                to={`/boards/${board.id}`}
                className="block no-underline text-inherit"
              >
                <div className="relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl p-7 shadow-lg hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/15 hover:-translate-y-1.5 transition-all group">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-slate-900 mb-3 tracking-tight group-hover:text-indigo-600 transition-colors">
                    {board.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700 font-semibold border border-slate-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                      {board._count?.columns || 0} columns
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {showCreate && (
          <div
            className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-6 z-50 backdrop-blur-md"
            onClick={() => setShowCreate(false)}
          >
            <div
              className="bg-white rounded-2xl w-full max-w-lg border border-slate-200/80 shadow-2xl animate-in fade-in zoom-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-7 py-6 border-b border-slate-100">
                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                  Create New Board
                </h2>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
                  onClick={() => setShowCreate(false)}
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <form onSubmit={handleCreateBoard}>
                <div className="p-7">
                  <div className="mb-5">
                    <label htmlFor="boardName" className="block mb-2 text-sm font-semibold text-slate-700">
                      Board Name
                    </label>
                    <input
                      id="boardName"
                      type="text"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      placeholder="e.g., Project Alpha"
                      required
                      autoFocus
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 px-7 py-5 border-t border-slate-100 bg-slate-50/50">
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all cursor-pointer"
                    onClick={() => setShowCreate(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
                        Creating...
                      </span>
                    ) : (
                      "Create Board"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
