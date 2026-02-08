import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Board from "../pages/Board";

export function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  function handleAuth(token: string) {
    localStorage.setItem("token", token);
    setToken(token);
  }

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleAuth} />} />
        <Route
          path="/register"
          element={<Register onRegister={handleAuth} />}
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/boards/:id" element={<Board />} />
      <Route path="*" element={<Navigate to="/boards/1" />} />
    </Routes>
  );
}
