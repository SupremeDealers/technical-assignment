import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../api";
import { Column } from "../components/Column";
import { TaskModal } from "../components/TaskModal";
import { CreateTaskModal } from "../components/CreateTaskModal";

export function BoardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { boardId } = useParams<{ boardId: string }>();
  const id = Number(boardId) || 1;

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [createColumnId, setCreateColumnId] = useState<number | null>(null);
  const [newColumnName, setNewColumnName] = useState("");
  const [showNewColumn, setShowNewColumn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: boardData } = useQuery({
    queryKey: ["board", id],
    queryFn: () => api.getBoard(id),
  });

  const { data: columnsData, isLoading, error } = useQuery({
    queryKey: ["columns", id],
    queryFn: () => api.getColumns(id),
  });

  const createColumnMutation = useMutation({
    mutationFn: (name: string) => api.createColumn(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns", id] });
      setNewColumnName("");
      setShowNewColumn(false);
    },
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
      }}>
        <div className="spinner spinner-lg" />
        <p style={{ fontStyle: "italic", color: "var(--text-muted)" }}>Loading your board...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
      }}>
        <p style={{ color: "var(--error)", fontSize: "1.1rem" }}>Failed to load board</p>
        <button className="btn btn-primary" onClick={() => queryClient.invalidateQueries({ queryKey: ["columns", id] })}>
          Try Again
        </button>
      </div>
    );
  }

  const columns = columnsData?.columns ?? [];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <header style={{
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border-light)",
        padding: "14px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(12px)",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <div style={{
              width: 36,
              height: 36,
              background: "var(--accent)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <span style={{ fontSize: 16, color: "white", fontWeight: 700 }}>◆</span>
            </div>
          </Link>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <Link to="/" style={{ fontSize: "0.7rem", color: "var(--text-muted)", textDecoration: "none" }}>Home</Link>
              <span style={{ color: "var(--border)", fontSize: "0.7rem" }}>›</span>
              <Link to="/boards" style={{ fontSize: "0.7rem", color: "var(--text-muted)", textDecoration: "none" }}>Boards</Link>
              <span style={{ color: "var(--border)", fontSize: "0.7rem" }}>›</span>
              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{boardData?.board?.name || "Board"}</span>
            </div>
            <h1 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.25rem",
              lineHeight: 1.2,
              margin: 0,
            }}>
              {boardData?.board?.name || "Sprint Board"}
            </h1>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: 220,
                padding: "8px 14px 8px 36px",
                fontSize: "0.85rem",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
              }}
              aria-label="Search tasks"
            />
            <span style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
              fontSize: "0.85rem",
            }}>
              ⌕
            </span>
          </div>

          {/* User menu */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 14px",
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius-md)",
          }}>
            <div style={{
              width: 28,
              height: 28,
              background: "var(--accent-light)",
              color: "var(--accent-hover)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}>
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{user?.username}</span>
          </div>

          <button
            className="btn btn-ghost btn-sm"
            onClick={handleLogout}
            style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ── Board ───────────────────────────────────────────────── */}
      <main style={{
        flex: 1,
        padding: "24px 28px",
        overflowX: "auto",
      }}>
        <div style={{
          display: "flex",
          gap: 20,
          alignItems: "flex-start",
          minHeight: "calc(100vh - 120px)",
        }}>
          {columns.map((col: any, idx: number) => (
            <Column
              key={col.id}
              column={col}
              boardId={id}
              searchTerm={searchTerm}
              onTaskClick={(taskId) => setSelectedTaskId(taskId)}
              onCreateTask={() => setCreateColumnId(col.id)}
              animationDelay={idx * 60}
            />
          ))}

          {/* Add column */}
          <div style={{
            minWidth: 280,
            flexShrink: 0,
            animation: `fadeIn 0.3s var(--ease) both`,
            animationDelay: `${columns.length * 60}ms`,
          }}>
            {showNewColumn ? (
              <div className="card" style={{ padding: 16 }}>
                <input
                  type="text"
                  placeholder="Column name..."
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newColumnName.trim()) {
                      createColumnMutation.mutate(newColumnName.trim());
                    }
                    if (e.key === "Escape") {
                      setShowNewColumn(false);
                      setNewColumnName("");
                    }
                  }}
                  autoFocus
                  style={{ marginBottom: 10 }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => newColumnName.trim() && createColumnMutation.mutate(newColumnName.trim())}
                    disabled={!newColumnName.trim()}
                  >
                    Add
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => { setShowNewColumn(false); setNewColumnName(""); }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="btn btn-secondary"
                onClick={() => setShowNewColumn(true)}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "14px",
                  border: "2px dashed var(--border)",
                  background: "transparent",
                  color: "var(--text-muted)",
                  fontStyle: "italic",
                }}
              >
                + Add Column
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {selectedTaskId && (
        <TaskModal
          taskId={selectedTaskId}
          boardId={id}
          onClose={() => setSelectedTaskId(null)}
        />
      )}

      {createColumnId && (
        <CreateTaskModal
          columnId={createColumnId}
          boardId={id}
          onClose={() => setCreateColumnId(null)}
        />
      )}
    </div>
  );
}
