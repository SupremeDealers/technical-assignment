import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export function BoardsListPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newBoardName, setNewBoardName] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["boards"],
    queryFn: () => api.getBoards(),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => api.createBoard(name),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      navigate(`/board/${data.board.id}`);
    },
  });

  const boards = data?.boards ?? [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Header */}
      <header style={{
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border-light)",
        padding: "14px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: "inherit" }}>
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
            <h1 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.25rem",
              margin: 0,
            }}>
              Team Boards
            </h1>
          </Link>
          <nav style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 12 }}>
            <Link to="/" style={{
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              textDecoration: "none",
              padding: "4px 10px",
              borderRadius: "var(--radius-sm)",
              transition: "all 0.2s",
            }}>Home</Link>
            <span style={{ color: "var(--border)", fontSize: "0.85rem" }}>·</span>
            <span style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              padding: "4px 10px",
              background: "var(--accent-light)",
              borderRadius: "var(--radius-sm)",
            }}>Boards</span>
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ color: "var(--text-muted)" }}>
            Sign out
          </button>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
        }}>
          <div>
            <h2 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.8rem",
              marginBottom: 4,
            }}>
              Your Boards
            </h2>
            <p style={{
              fontStyle: "italic",
              color: "var(--text-muted)",
              fontSize: "0.9rem",
            }}>
              Select a board or create a new one
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreate(true)}
          >
            + New Board
          </button>
        </div>

        {/* Create board inline */}
        {showCreate && (
          <div className="card slide-up" style={{
            padding: "20px 24px",
            marginBottom: 20,
            display: "flex",
            gap: 12,
            alignItems: "flex-end",
          }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="board-name">Board Name</label>
              <input
                id="board-name"
                type="text"
                placeholder="e.g., Sprint Board"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newBoardName.trim()) createMutation.mutate(newBoardName.trim());
                  if (e.key === "Escape") { setShowCreate(false); setNewBoardName(""); }
                }}
                autoFocus
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={() => newBoardName.trim() && createMutation.mutate(newBoardName.trim())}
              disabled={!newBoardName.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </button>
            <button className="btn btn-ghost" onClick={() => { setShowCreate(false); setNewBoardName(""); }}>
              Cancel
            </button>
          </div>
        )}

        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <div className="spinner spinner-lg" />
          </div>
        ) : boards.length === 0 ? (
          <div className="card" style={{
            padding: "48px 32px",
            textAlign: "center",
          }}>
            <p style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.2rem",
              color: "var(--text-secondary)",
              fontStyle: "italic",
              marginBottom: 16,
            }}>
              No boards yet
            </p>
            <p style={{
              color: "var(--text-muted)",
              fontSize: "0.9rem",
              marginBottom: 20,
            }}>
              Create your first board to start organizing your team's work.
            </p>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              + Create Your First Board
            </button>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 16,
          }}>
            {boards.map((board: any) => (
              <div
                key={board.id}
                className="card"
                onClick={() => navigate(`/board/${board.id}`)}
                style={{
                  padding: "24px",
                  cursor: "pointer",
                  transition: "all 0.2s var(--ease)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-light)";
                  e.currentTarget.style.transform = "none";
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") navigate(`/board/${board.id}`); }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  background: "var(--accent-subtle)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}>
                  <span style={{ fontSize: 18 }}>📋</span>
                </div>
                <h3 style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.05rem",
                  marginBottom: 4,
                }}>
                  {board.name}
                </h3>
                <p style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  fontStyle: "italic",
                }}>
                  Created {new Date(board.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
