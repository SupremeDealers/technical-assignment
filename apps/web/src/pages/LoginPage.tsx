import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(145deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--accent-subtle) 100%)",
      padding: 24,
    }}>
      <div className="slide-up" style={{
        width: "100%",
        maxWidth: 420,
      }}>
        {/* Logo area */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 56,
            height: 56,
            background: "var(--accent)",
            borderRadius: "var(--radius-lg)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            boxShadow: "var(--shadow-md)",
          }}>
            <span style={{ fontSize: 24, color: "white" }}>◆</span>
          </div>
          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.8rem",
            color: "var(--text-primary)",
            marginBottom: 4,
          }}>
            Team Boards
          </h1>
          <p style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            color: "var(--text-muted)",
            fontSize: "0.95rem",
          }}>
            Sign in to your workspace
          </p>
        </div>

        {/* Form card */}
        <div className="card" style={{ padding: "32px 28px" }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: "10px 14px",
                background: "#fdeaea",
                color: "var(--error)",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.85rem",
                marginBottom: 20,
                border: "1px solid #f5cdcd",
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: 18 }}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="alice@demo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "0.95rem",
                fontWeight: 600,
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div style={{
            marginTop: 20,
            textAlign: "center",
            fontSize: "0.85rem",
            color: "var(--text-muted)",
          }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ fontWeight: 600 }}>Create one</Link>
          </div>
        </div>

        {/* Hint */}
        <p style={{
          textAlign: "center",
          marginTop: 20,
          fontSize: "0.8rem",
          color: "var(--text-muted)",
          fontStyle: "italic",
        }}>
          Demo: alice@demo.com / password123
        </p>
      </div>
    </div>
  );
}
