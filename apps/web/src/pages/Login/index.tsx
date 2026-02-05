import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { auth } from "../../api/client";
import { useAuth } from "../../auth/context";
import styles from "./index.module.css";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => auth.login({ email, password }),
    onSuccess: (data) => {
      login(data.token, data.user);
      navigate("/", { replace: true });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Sign in</h1>
        <p className={styles.authSubtitle}>Team Boards</p>
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <label htmlFor="login-email" className={styles.authLabel}>
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.authInput}
            required
            aria-invalid={!!(mutation.error && email)}
          />
          <label htmlFor="login-password" className={styles.authLabel}>
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.authInput}
            required
            aria-invalid={!!(mutation.error && password)}
          />
          {mutation.error && (
            <p className={styles.authError} role="alert">
              {(mutation.error as { error?: { message?: string } })?.error?.message ?? "Login failed"}
            </p>
          )}
          <button type="submit" className={styles.authButton} disabled={mutation.isPending}>
            {mutation.isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className={styles.authFooter}>
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
