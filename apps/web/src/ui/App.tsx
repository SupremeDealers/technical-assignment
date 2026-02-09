import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { DashboardPage } from "../pages/DashboardPage";
import { BoardPage } from "../pages/BoardPage";
import { APP_ROUTES } from "../data/route";
import { baseService } from "../store/services/base.service";

export function App() {
  const isAuthenticated = baseService.getToken() !== null;
  return (
    <Routes>
      <Route
        path={APP_ROUTES.LOGIN_PAGE}
        element={
          isAuthenticated ? (
            <Navigate to={APP_ROUTES.DASHBOARD_PAGE} replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path={APP_ROUTES.REGISTER_PAGE}
        element={
          isAuthenticated ? (
            <Navigate to={APP_ROUTES.DASHBOARD_PAGE} replace />
          ) : (
            <RegisterPage />
          )
        }
      />

      <Route path={APP_ROUTES.DASHBOARD_PAGE} element={<DashboardPage />} />
      <Route path={APP_ROUTES.BOARD_PAGE} element={<BoardPage />} />

      {/* Default redirect */}
      <Route
        path="/"
        element={
          <Navigate
            to={
              isAuthenticated
                ? APP_ROUTES.DASHBOARD_PAGE
                : APP_ROUTES.LOGIN_PAGE
            }
            replace
          />
        }
      />
    </Routes>
  );
}
