import { useAuth } from "../hooks/useAuth";
import { Login } from "./Login";
import { Board } from "./Board";

export function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-container">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <Board />;
}
