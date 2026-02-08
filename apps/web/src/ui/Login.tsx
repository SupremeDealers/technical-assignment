import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card-new">
        <div className="auth-logo">
          <h1>Kanban Application</h1>
          <p>{isLogin ? "Welcome back! Please sign in to continue." : "Join us! Create an account to get started."}</p>
        </div>

        {error && (
          <div style={{ 
            background: "#fee2e2", 
            color: "#b91c1c", 
            padding: "0.75rem", 
            borderRadius: "8px", 
            fontSize: "0.875rem", 
            marginBottom: "1.5rem",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group-auth">
            <label className="form-label" style={{ fontWeight: 600 }}>Email Address</label>
            <input
              type="email"
              className="form-input"
              style={{ marginBottom: 0 }}
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group-auth">
            <label className="form-label" style={{ fontWeight: 600 }}>Password</label>
            <input
              type="password"
              className="form-input"
              style={{ marginBottom: 0 }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-large">
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? (
            <>
              Don't have an account? 
              <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(false); }}>Register</a>
            </>
          ) : (
            <>
              Already have an account? 
              <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(true); }}>Sign In</a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
