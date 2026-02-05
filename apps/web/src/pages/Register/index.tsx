import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { auth } from "../../api/client";
import { useAuth } from "../../auth/context";
import styles from "./index.module.css";

export function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const mutation = useMutation({
    mutationFn: () => auth.register({ email, password, name }),
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
        <h1 className={styles.authTitle}>Create account</h1>
        <p className={styles.authSubtitle}>Team Boards</p>
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <label htmlFor="reg-name" className={styles.authLabel}>
            Name
          </label>
          <input
            id="reg-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.authInput}
            required
          />
          <label htmlFor="reg-email" className={styles.authLabel}>
            Email
          </label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.authInput}
            required
            aria-invalid={!!(mutation.error && email)}
          />
          <label htmlFor="reg-password" className={styles.authLabel}>
            Password
          </label>
          <input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.authInput}
            required
            minLength={6}
            aria-describedby="password-hint"
          />
          <p id="password-hint" className={styles.authHint}>
            At least 6 characters
          </p>
          {mutation.error && (
            <p className={styles.authError} role="alert">
              {(mutation.error as { error?: { message?: string } })?.error?.message ?? "Registration failed"}
            </p>
          )}
          <button type="submit" className={styles.authButton} disabled={mutation.isPending}>
            {mutation.isPending ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className={styles.authFooter}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
