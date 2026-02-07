import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../auth";
import { AppLayout } from "../components/layout/AppLayout";
import { Login } from "../routes/Login";
import { Register } from "../routes/Register";
import { Board } from "../routes/Board";
import { Home } from "../routes/Home";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/boards/:boardId"
          element={
            <RequireAuth>
              <Board />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
