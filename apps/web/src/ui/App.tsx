import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../core/AuthContext";
import { AuthScreen } from "./features/auth/AuthScreen";
import { Board } from "./features/kanban/Board";

const AppContent = () => {
  const { token } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <Routes>
        <Route
          path="/login"
          element={!token ? <AuthScreen mode="login" /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={
            !token ? <AuthScreen mode="register" /> : <Navigate to="/" />
          }
        />
        <Route
          path="/"
          element={token ? <Board /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
};
