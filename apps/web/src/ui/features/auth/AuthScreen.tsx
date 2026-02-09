import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../core/AuthContext";
import { apiFetch } from "../../../core/api";

export const AuthScreen = ({ mode }: { mode: "login" | "register" }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const data = await apiFetch(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      login(data.token, data.user);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      <div className="hidden md:flex md:w-1/2 bg-black text-white p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined !text-4xl">
            architecture
          </span>
          <h1 className="text-2xl font-bold tracking-tighter uppercase leading-none">
            Kanban
          </h1>
        </div>

        <div className="space-y-8">
          <h2 className="text-7xl font-light tracking-tighter leading-tight">
            ESTABLISH
            <br />
            SYSTEM
            <br />
            ORDER.
          </h2>
          <div className="h-px bg-white/20 w-48"></div>
          <p className="text-xs tracking-[0.3em] font-bold uppercase opacity-60 max-w-sm">
            Integrated task management system for architectural clarity and
            workflow precision.
          </p>
        </div>

        <div className="flex justify-between items-end border-t border-white/10 pt-8 text-[10px] font-bold tracking-[0.2em] uppercase">
          <span>V2.4.1 REVISION</span>
          <div className="flex gap-4">
            <span>01. SYSTEM CORE</span>
            <span>/</span>
            <span>02. UI LAYER</span>
          </div>
        </div>
      </div>

      {/* Right Content (Form) */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>

        <div className="w-full max-w-sm relative z-10">
          <div className="mb-12">
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase mb-4 opacity-40">
              Security Protocol / {mode}
            </p>
            <h3 className="text-4xl font-light tracking-tight">
              {mode === "login" ? "Authentication" : "Register Profile"}
            </h3>
          </div>

          {error && (
            <div className="border-strict p-4 mb-8 bg-red-50 flex items-start gap-3">
              <span className="material-symbols-outlined text-red-500 !text-lg">
                error
              </span>
              <p className="text-[11px] font-bold uppercase tracking-wider text-red-500 leading-relaxed">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest uppercase opacity-40">
                Username
              </label>
              <div className="relative group">
                <input
                  className="w-full border-strict p-4 text-sm font-light outline-none focus:bg-gray-50 transition-all placeholder:opacity-20"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="USERNAME_KEY"
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined">key</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest uppercase opacity-40">
                Password
              </label>
              <div className="relative group">
                <input
                  className="w-full border-strict p-4 text-sm font-light outline-none focus:bg-gray-50 transition-all placeholder:opacity-20"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined">lock_open</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full border-strict bg-black text-white p-5 text-xs font-bold tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all duration-300 mt-8 flex items-center justify-center gap-4"
            >
              <span>
                {mode === "login" ? "Initiate Session" : "Create Record"}
              </span>
              <span className="material-symbols-outlined !text-lg">
                arrow_forward
              </span>
            </button>
          </form>

          <p className="mt-12 text-center text-[10px] font-bold tracking-[0.2em] uppercase">
            <span className="opacity-40">
              {mode === "login"
                ? "Unauthorized access prohibited. "
                : "Join the architectural network. "}
            </span>
            <Link
              to={mode === "login" ? "/register" : "/login"}
              className="underline hover:opacity-50 transition-opacity"
            >
              {mode === "login" ? "Request Access" : "Existing Users"}
            </Link>
          </p>
        </div>

        <div className="absolute bottom-8 right-8 flex gap-4 opacity-20 text-[9px] font-mono">
          <span>TC-PRO-88</span>
          <span>/</span>
          <span>SECURE_PIPE_ENABLED</span>
        </div>
      </div>
    </div>
  );
};
