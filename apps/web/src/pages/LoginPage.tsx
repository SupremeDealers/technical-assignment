"use client";

import React from "react";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export function LoginPage({ onSwitchToRegister }: LoginPageProps) {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password123");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError("Please fill in all fields");
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-md">
      <div className="w-full max-w-1/3 bg-white rounded-md shadow-sm p-xl">
        <h1 className="mb-xs text-2xl font-bold text-center text-gray-900">Team Boards</h1>
        <p className="mb-lg text-sm text-gray-600 text-center">
          Sign in to your account
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-900"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isLoading}
              className="bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-900"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              disabled={isLoading}
              className="bg-white text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          {(error || localError) && (
            <div className="p-sm bg-red-100 border border-red-300 rounded-md text-sm text-red-900">
              {error || localError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`px-md py-sm text-sm font-semibold text-white bg-blue-600 border-none rounded-md transition-opacity ${
              isLoading ? "opacity-60 cursor-not-allowed" : "opacity-100 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-lg text-sm text-black text-center">
          {"Don't have an account? "}
          <button
            onClick={onSwitchToRegister}
            disabled={isLoading}
            className="bg-none border-none text-blue-600 cursor-pointer underline p-0 text-sm font-inherit hover:text-blue-700"
          >
            Register
          </button>
        </p>

        <div className="mt-md p-sm bg-gray-50 rounded-md text-xs text-gray-600 border border-gray-200">
          <p className="mb-xs font-semibold text-black">Demo Credentials:</p>
          <p className="my-xs text-gray-500">Email: demo@example.com</p>
          <p className="my-xs text-gray-500">Password: password123</p>
        </div>
      </div>
    </div>
  );
}
