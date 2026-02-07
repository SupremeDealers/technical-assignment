import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useIsAuthenticated } from "../hooks/useAuth";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
// import { Dashboard } from "../pages/Dashboard";

function PrivateRoute({ children }: { children: React.ReactNode }) {
 const isAuthenticated = useIsAuthenticated();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
const isAuthenticated = useIsAuthenticated();
  return !isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/dashboard" replace />
  );
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        {/* <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        /> */}
        {/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
