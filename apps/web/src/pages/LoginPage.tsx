import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ApiClientError } from "../api/client";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.error.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      backgroundColor: "#f0f2f5",
      padding: "1rem",
    }}>
      <div style={{ 
        backgroundColor: "white", 
        padding: "2.5rem", 
        borderRadius: "12px", 
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        width: "100%",
        maxWidth: "440px",
        border: "1px solid #e4e6eb",
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{
            marginTop: 0,
            marginBottom: "0.5rem",
            fontSize: "2rem",
            fontWeight: 700,
            color: "#1c1e21",
            letterSpacing: "-0.02em",
          }}>
            Team Boards
          </h1>
          <p style={{ margin: 0, color: "#65676b", fontSize: "0.9375rem" }}>
            Sign in to your account
          </p>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              padding: "0.875rem 1rem",
              marginBottom: "1.25rem",
              backgroundColor: "#fee",
              border: "1px solid #fbb",
              borderRadius: "8px",
              color: "#c00",
              fontSize: "0.875rem",
              lineHeight: 1.4,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: 600,
                fontSize: "0.875rem",
                color: "#1c1e21",
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                fontSize: "0.9375rem",
                border: "1px solid #d0d3d9",
                borderRadius: "8px",
                boxSizing: "border-box",
                transition: "all 0.2s ease",
                backgroundColor: "#f8f9fa",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#0084ff";
                e.currentTarget.style.backgroundColor = "white";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#d0d3d9";
                e.currentTarget.style.backgroundColor = "#f8f9fa";
              }}
            />
          </div>

          <div style={{ marginBottom: "1.75rem" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: 600,
                fontSize: "0.875rem",
                color: "#1c1e21",
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                fontSize: "0.9375rem",
                border: "1px solid #d0d3d9",
                borderRadius: "8px",
                boxSizing: "border-box",
                transition: "all 0.2s ease",
                backgroundColor: "#f8f9fa",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#0084ff";
                e.currentTarget.style.backgroundColor = "white";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#d0d3d9";
                e.currentTarget.style.backgroundColor = "#f8f9fa";
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "0.875rem",
              fontSize: "0.9375rem",
              fontWeight: 600,
              color: "white",
              backgroundColor: isLoading ? "#b0b3b8" : "#0084ff",
              border: "none",
              borderRadius: "8px",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = "#0073e6";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = "#0084ff";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
              }
            }}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={{ marginTop: "1.75rem", textAlign: "center", color: "#65676b", fontSize: "0.9375rem" }}>
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "#0084ff",
              textDecoration: "none",
              fontWeight: 600,
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
          >
            Register
          </Link>
        </p>

        {/* <div style={{ 
          marginTop: "1.75rem", 
          padding: "1.25rem", 
          backgroundColor: "#e7f3ff", 
          borderRadius: "8px",
          fontSize: "0.875rem",
          border: "1px solid #b3d9ff",
        }}>
          <p style={{ margin: 0, fontWeight: 600, color: "#1c1e21", marginBottom: "0.5rem" }}>
            💡 Demo credentials:
          </p>
          <p style={{ margin: 0, color: "#1c1e21", fontFamily: "monospace", fontSize: "0.8125rem" }}>
            alice@example.com / password123
          </p>
        </div> */}
      </div>
    </div>
  );
}
