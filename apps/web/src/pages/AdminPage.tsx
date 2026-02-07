import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminPage() {
  const { user } = useAuth();
  if (user?.role !== 'admin') { //check on mount if user accidently come
    return <Navigate to="/board" replace />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
      <p className="text-gray-600">
        This page will allow admins to Create/Delete Boards and Columns.
        Waiting for design instructions...
      </p>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg shadow border border-gray-200 h-64 flex items-center justify-center">
          MANAGE BOARDS UI
        </div>
        <div className="p-6 bg-white rounded-lg shadow border border-gray-200 h-64 flex items-center justify-center">
          MANAGE COLUMNS UI
        </div>
      </div>
    </div>
  );
}