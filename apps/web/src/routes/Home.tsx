import { Link, Navigate } from "react-router-dom";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { useAuth } from "../auth";
import { Button } from "../components/ui/button";

export function Home() {
  const { user, boardId } = useAuth();

  if (user) {
    if (boardId) {
      return <Navigate to={`/boards/${boardId}`} replace />;
    }
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto">
            <LayoutGrid className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-heading text-2xl font-bold">No board yet</h2>
          <p className="text-muted-foreground max-w-sm">
            Your workspace is ready. Create your first board to start organizing tasks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
      <div className="text-center space-y-6 max-w-lg px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary mx-auto shadow-lg">
          <LayoutGrid className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="font-heading text-4xl font-bold tracking-tight">
          Organize your work with <span className="text-primary">TeamBoards</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          A clean, modern Kanban board to help teams collaborate and track tasks efficiently.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg">
            <Link to="/register">
              Get started free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
