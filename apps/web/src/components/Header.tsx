import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./Button";
import { SearchModal } from "../pages/boards/SmartSearch";
import { FiSearch } from "react-icons/fi";
import "./Header.css";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="header-logo">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="32" height="32" rx="8" fill="var(--color-primary)" />
            <path
              d="M8 10h4v12H8V10zm6 4h4v8h-4v-8zm6-6h4v14h-4V8z"
              fill="white"
            />
          </svg>
          <span>Team Boards</span>
        </Link>

        {user && (
          <div className="header-user">
            <button
              className="search-trigger-btn"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
            >
              <span><FiSearch /></span>
              <span>Search...</span>
              <kbd>⌘K</kbd>
            </button>
            
            <div className="header-user-info">
              <div className="avatar" title={user.name}>
                {getInitials(user.name)}
              </div>
              <span className="header-user-name">{user.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        )}
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
