import { useMutation } from "@tanstack/react-query";
import { login, register, AuthResponse } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ id: number; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data: AuthResponse) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      navigate("/");
    },
  });

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (data: AuthResponse) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      navigate("/");
    },
  });

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return {
    user,
    isLoading,
    login: loginMutation,
    register: registerMutation,
    logout,
  };
};
