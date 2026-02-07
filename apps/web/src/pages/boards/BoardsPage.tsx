import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getBoards } from "../../api/client";
import { Header } from "../../components/Header";
import { Loading } from "../../components/Loading";
import "./BoardsPage.css";

export function BoardsPage() {
  const { token } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["boards"],
    queryFn: () => getBoards(token!),
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <>
        <Header />
        <Loading fullPage text="Loading boards..." />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="boards-page">
          <div className="error-message">Failed to load boards. Please try again.</div>
        </div>
      </>
    );
  }

  const boards = data?.boards || [];

  return (
    <>
      <Header />
      <main className="boards-page">
        <div className="boards-header">
          <h1>Your Boards</h1>
        </div>

        {boards.length === 0 ? (
          <div className="empty-state">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <line x1="15" y1="3" x2="15" y2="21" />
            </svg>
            <h3>No boards yet</h3>
            <p>Create your first board to get started with organizing your tasks.</p>
          </div>
        ) : (
          <div className="boards-grid">
            {boards.map((board) => (
              <Link key={board.id} to={`/boards/${board.id}`} className="board-card">
                <h3 className="board-card-title">{board.name}</h3>
                {board.description && (
                  <p className="board-card-desc">{board.description}</p>
                )}
                <div className="board-card-meta">
                  Created {new Date(board.created_at).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
