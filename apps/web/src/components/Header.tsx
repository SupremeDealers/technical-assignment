import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BOARD_RULES } from '../constants/rules';
import { 
  KanbanSquare, 
  LogOut, 
  Settings, 
  ArrowLeft, 
  Info 
} from 'lucide-react';
import { cn } from '../utils/cn';

export const Header = () => {
  const { user, logoutUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const showBackButton = location.pathname !== '/board';

  return (
    <div className="flex flex-col w-full bg-white shadow-sm z-50 relative">
      
      {/*Top Header part*/}
      <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-white">
        

        <Link to="/board" className="flex items-center gap-2 group">
          <div className="p-1.5 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
            <KanbanSquare className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">
            Task Management
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {/* admin only  */}
          {user?.role === 'admin' && (
            <Link 
              to="/admin"
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === '/admin' 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Settings className="h-4 w-4" />
              <span>Manipulate Board</span>
            </Link>
          )}

          <div className="h-6 w-px bg-gray-300 mx-1" />

          <button
            onClick={logoutUser}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/*Bottom header part*/}
      <div className="h-10 bg-gray-50 border-b border-gray-200 px-6 grid grid-cols-3 items-center text-sm">
        
        {/*back Button */}
        <div className="flex justify-start">
          {showBackButton && (
            <button
              onClick={() => navigate('/board')}
              className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
          )}
        </div>

        {/*user name */}
        <div className="flex justify-center items-center gap-2 text-gray-700">
          <span className="text-gray-400">User:</span>
          <span className="font-semibold">{user?.name}</span>
          {user?.role === 'admin' && (
            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded-full tracking-wider">
              Admin
            </span>
          )}
        </div>

        <div className="flex justify-end">
          <div className="group relative flex items-center gap-1.5 cursor-help text-gray-600 hover:text-blue-600 font-medium transition-colors">
            <span>Rules</span>
            <Info className="h-4 w-4" />

            {/*Hover the rule card*/}
            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-4 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-out z-50">
              <h4 className="font-bold text-gray-900 mb-2 pb-2 border-b border-gray-100">
                Board Guidelines
              </h4>
              <ul className="space-y-2">
                {BOARD_RULES.map((rule, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                    <span className="font-bold text-blue-500 mt-0.5">•</span>
                    {rule}
                  </li>
                ))}
              </ul>
              <div className="absolute -top-1.5 right-2 w-3 h-3 bg-white border-t border-l border-gray-200 rotate-45 transform" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};