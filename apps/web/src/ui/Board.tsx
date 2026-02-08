import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBoardColumns, getBoards } from "../api/boards";
import { Column } from "./Column";
import { useAuth } from "../hooks/useAuth";

export function Board() {
  const { logout, user } = useAuth();
  const [search, setSearch] = useState("");

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

  if (isLoading) return <div style={{ padding: "2rem" }}>Loading Board...</div>;

  return (
    <div>
      <header style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        padding: "1rem 2rem", 
        background: "white", 
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: "700" }}>{boards?.[0]?.name || "Team Board"}</h1>
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="form-input" 
            style={{ width: "250px", marginBottom: 0 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{user?.email}</span>
          <button 
            onClick={logout}
            style={{ 
              background: "none", 
              border: "1px solid var(--border)", 
              padding: "0.4rem 0.8rem", 
              borderRadius: "6px",
              fontSize: "0.875rem"
            }}
          >
            Logout
          </button>
        </div>
      </header>
      
      <div className="board-container">
        <div className="columns-wrapper">
          {columns?.sort((a, b) => a.order - b.order).map((column) => (
            <Column key={column.id} column={column} search={search} />
          ))}
        </div>
      </div>
    </div>
  );
}
