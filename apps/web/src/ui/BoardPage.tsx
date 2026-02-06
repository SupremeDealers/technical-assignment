import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../AuthContext";
import { boardAPI, columnAPI } from "../api";
import { BoardUI } from "./BoardUI";

interface Board {
  id: string;
  name: string;
  columns: Array<{
    id: string;
    name: string;
    order: number;
    tasks: Array<{
      id: string;
      title: string;
      description?: string;
      order: number;
      columnId: string;
      createdAt: string;
    }>;
  }>;
}

export function BoardPage() {
  const { user, logout } = useAuth();
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  const boardsQuery = useQuery({
    queryKey: ["boards"],
    queryFn: () => boardAPI.list(),
  });

  const boardQuery = useQuery({
    queryKey: ["board", selectedBoardId],
    queryFn: () => boardAPI.get(selectedBoardId!),
    enabled: !!selectedBoardId,
  });

  // Select first board if not selected
  const boards =useMemo(() => boardsQuery.data || [], [boardsQuery.data]);
  const activeBoard = selectedBoardId
    ? (boardQuery.data as Board | undefined)
    : null;

  React.useEffect(() => {
    if (boards.length > 0 && !selectedBoardId) {
      setSelectedBoardId(boards[0].id);
    }
  }, [boards, selectedBoardId]);

  if (boardsQuery.isLoading) {
    return <div style={{ padding: 24 }}>Loading boards...</div>;
  }

  if (boardsQuery.isError) {
    return (
      <div style={{ padding: 24, color: "red" }}>
        Error loading boards: {(boardsQuery.error as any)?.message}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Header */}
      <header style={{
        backgroundColor: "#fff",
        borderBottom: "1px solid #ddd",
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Team Boards</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "#666" }}>{user?.email}</span>
          <button
            onClick={logout}
            style={{
              padding: "8px 16px",
              backgroundColor: "#f0f0f0",
              border: "1px solid #ccc",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <div style={{ display: "flex", height: "calc(100vh - 60px)" }}>
        {/* Sidebar */}
        <div style={{
          width: 280,
          backgroundColor: "#fff",
          borderRight: "1px solid #ddd",
          padding: 16,
          overflowY: "auto",
        }}>
          <h3 style={{ marginTop: 0 }}>Boards</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {boards.map((b: any) => (
              <button
                key={b.id}
                onClick={() => setSelectedBoardId(b.id)}
                style={{
                  padding: "12px 16px",
                  backgroundColor: selectedBoardId === b.id ? "#e3f2fd" : "#fff",
                  border: "1px solid " + (selectedBoardId === b.id ? "#0066cc" : "#ddd"),
                  borderRadius: 4,
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 14,
                  color: selectedBoardId === b.id ? "#0066cc" : "#000",
                  fontWeight: selectedBoardId === b.id ? 600 : 400,
                }}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {activeBoard ? (
            <BoardUI board={activeBoard} />
          ) : (
            <div>Select a board</div>
          )}
        </div>
      </div>
    </div>
  );
}
