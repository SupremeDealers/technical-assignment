import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth-context";

export function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Team Boards</h1>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span>Welcome, {user?.name}!</span>
          <button
            onClick={logout}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <section style={{ marginTop: 16, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Your Boards</h2>
        <p>
          You are logged in as <strong>{user?.email}</strong>
        </p>
        <button
          onClick={() => navigate("/board/1")}
          style={{
            marginTop: "16px",
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "600",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Open Team Project Board →
        </button>
      </section>
    </div>
  );
}
