import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import AuthPage from '../pages/AuthPage';
import { LoadingPage } from '../pages/LoadingPage';
import { Header } from '../components/Header';
import AdminPage from '../pages/AdminPage';
import TaskPage from '../pages/TaskPage'
import BoardDashboard from "../pages/BoardDashboard"
//Layout
const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};


//Public route
const PublicRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingPage />;
  return user ? <Navigate to="/board" replace /> : <Outlet />;
};

// Protected rouite for authentication
const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingPage />;
  return user ? <MainLayout /> : <Navigate to="/" replace />;
};

//Protected route for admin only
const AdminRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingPage />;
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'admin') return <Navigate to="/board" replace />;
  return <MainLayout />;
};

//Routing
export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<AuthPage />} />
          </Route>

          {/* Protected Routes*/}
          <Route element={<ProtectedRoute />}>
            <Route path="/board" element={<BoardDashboard />} />
            <Route path="/:boardId/:columnId/task/:taskId" element={<TaskPage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}