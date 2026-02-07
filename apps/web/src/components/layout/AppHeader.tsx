import { Link, useNavigate } from "react-router-dom";
import { LayoutGrid, LogOut } from "lucide-react";
import { useAuth } from "../../auth";
import { useAuthMutations } from "../../queries";
import { Button } from "../ui/button";

export function AppHeader() {
  const { user, setAuth } = useAuth();
  const navigate = useNavigate();
  const { logout } = useAuthMutations();

  const onLogout = async () => {
    await logout.mutateAsync();
    setAuth(null, null);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white backdrop-blur">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-heading text-lg font-bold text-foreground transition-colors hover:text-primary"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LayoutGrid className="h-4 w-4" />
          </div>
          <span>TeamBoards</span>
        </Link>

        <div className="flex-1" />

        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Hi, {user.name}</span>
            <Button variant="destructive" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get started</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
