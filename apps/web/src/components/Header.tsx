import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./Button";
import "./Header.css";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    </header>
  );
}
