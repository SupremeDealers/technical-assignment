import { Outlet, Navigate } from "react-router-dom";

export default function AppLayout() {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow px-6 py-4 font-semibold">
        Team Boards
      </header>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
