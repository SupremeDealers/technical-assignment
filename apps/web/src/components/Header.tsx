import { Link, useNavigate } from "react-router-dom";
import { useLogout } from "../store/services/auth.service";
import { useAuthStore } from "../store/state/auth.store";
import { APP_ROUTES } from "../data/route";
import { baseService } from "../store/services/base.service";

const Header = () => {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setTimeout(() => {
      navigate(APP_ROUTES.LOGIN_PAGE);
    }, 50);
  };
  const isAuthenticated = baseService.getToken() !== null;

  return (
    <header className="flex justify-between items-center p-4 bg-white border-b border-gray-300">
      <Link
        to={isAuthenticated ? APP_ROUTES.DASHBOARD_PAGE : APP_ROUTES.LOGIN_PAGE}
        className="text-3xl font-semibold cursor-pointer"
      >
        Dashboard
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-gray-700">
          Welcome, <strong>{user?.username}</strong>!
        </span>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white border-semibold text-sm font-bold rounded cursor-pointer hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
