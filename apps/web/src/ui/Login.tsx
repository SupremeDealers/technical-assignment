import React, { useState } from "react";
import { apiFetch } from "../api/client";
import { useAuth } from "../hooks/useAuth";

export function Login() {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password123");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const endpoint = isRegistering ? "/auth/register" : "/auth/login";
      const data = await apiFetch<{ user: any; token: string }>(endpoint, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      
      login(data.user, data.token);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">{isRegistering ? "Create Account" : "Team Boards Log In"}</h1>
        
        {error && (
          <div style={{ color: "#ef4444", marginBottom: "1rem", fontSize: "0.875rem", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn">
            {isRegistering ? "Register" : "Sign In"}
          </button>
        </form>

        <p style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.875rem", color: "var(--text-muted)" }}>
          {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: "600", padding: 0 }}
          >
            {isRegistering ? "Sign In" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}
