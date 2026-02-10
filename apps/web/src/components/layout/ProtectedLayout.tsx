import { Outlet, Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Layout, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedLayout() {
    const { user, isLoading, isAuthenticated, logout } = useAuth();

    // Show loading state briefly while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">Loading...</span>
                </div>
            </div>
        );
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace />;
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-8">
                    <Link to="/" className="flex items-center gap-2 font-semibold">
                        <Layout className="h-6 w-6" />
                        <span>Kanban App</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        {/* User info */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                <User className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-foreground">
                                {user?.name || 'User'}
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={logout}
                            className="gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </Button>
                    </div>
                </div>
            </header>
            <main className="w-full px-8 mx-auto pt-4">
                <Outlet />
            </main>
        </div>
    );
}

