import React from "react";
import type { User } from "./types";

type AuthState = {
  user: User | null;
  boardId: string | null;
};

type AuthContextValue = AuthState & {
  setAuth: (user: User | null, boardId: string | null) => void;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "tb_auth";

function readStored(): AuthState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { user: null, boardId: null };
  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    return { user: null, boardId: null };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>(readStored);

  const setAuth = React.useCallback((user: User | null, boardId: string | null) => {
    const next = { user, boardId };
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
