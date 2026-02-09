import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { BoardView } from "./pages/board/BoardView";
import { AuthLayout } from "./components/layout/AuthLayout";
import { ProtectedLayout } from "./components/layout/ProtectedLayout";

const router = createBrowserRouter([
    {
        path: "/auth",
        element: <AuthLayout />,
        children: [
            {
                path: "login",
                element: <Login />,
            },
            {
                path: "register",
                element: <Register />,
            },
        ],
    },
    {
        path: "/",
        element: <ProtectedLayout />,
        children: [
            {
                path: "/",
                element: <Dashboard />,
            },
            {
                path: "/boards/:boardId",
                element: <BoardView />,
            },
        ],
    },
    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
]);

export function Router() {
    return <RouterProvider router={router} />;
}
