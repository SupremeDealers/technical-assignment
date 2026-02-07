import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, getMeUser } from "../lib/api";

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);

        // Verify token with server in the background
        // But don't clear on failure - they stay logged in with cached data
        getMeUser(savedToken)
          .then((response) => {
            // Token is valid, update user if changed
            setUser(response.user);
          })
          .catch((err) => {
            // Token verification failed, but keep user logged in with cached data
            console.warn("Token verification failed:", err.message);
            // Don't clear token/user - they can stay logged in until they explicitly logout
          })
          .finally(() => {
            setIsLoading(false);
          });
      } catch (err) {
        console.error("Failed to parse user from localStorage:", err);
        // Invalid JSON in localStorage, clear everything
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginUser(email, password);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await registerUser(email, password, name);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
