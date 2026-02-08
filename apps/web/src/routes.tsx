import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { BoardPage } from "./pages/Board";
import { TaskDetails } from "./pages/TaskDetails";

// Simple Auth Guard
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <BoardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/tasks/:taskId",
    element: (
      <ProtectedRoute>
        <>
          <BoardPage />
          <TaskDetails />
        </>
      </ProtectedRoute>
    ),
  },
]);
