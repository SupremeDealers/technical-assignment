import { useState, useEffect } from "react";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  function saveToken(t: string) {
    localStorage.setItem("token", t);
    setToken(t);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
  }

  return { token, saveToken, logout };
}
