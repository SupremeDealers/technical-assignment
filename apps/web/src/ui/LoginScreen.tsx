import React, { useState } from "react";
import { useAuth } from "../AuthContext";

export function LoginScreen() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("demo@teamboards.dev");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <div style={{
      maxWidth: 400,
      margin: "60px auto",
      padding: 24,
      border: "1px solid #ddd",
      borderRadius: 8,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    }}>
      <h1 style={{ marginTop: 0, textAlign: "center" }}>Team Boards</h1>
      <p style={{ textAlign: "center", color: "#666" }}>Sign in to your account</p>

      {error && (
        <div style={{
          padding: 12,
          marginBottom: 16,
          backgroundColor: "#fee",
          border: "1px solid #fcc",
          borderRadius: 4,
          color: "#c00",
          fontSize: 14,
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ccc",
              borderRadius: 4,
              fontSize: 14,
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            required
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ccc",
              borderRadius: 4,
              fontSize: 14,
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: 10,
            backgroundColor: isLoading ? "#ccc" : "#0066cc",
            color: "white",
            border: "none",
            borderRadius: 4,
            fontSize: 16,
            fontWeight: 600,
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: 12, color: "#999", marginTop: 16 }}>
        Demo credentials pre-filled above
      </p>
    </div>
  );
}
