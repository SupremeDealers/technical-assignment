import { useAuth } from "../AuthContext";
import { AuthPages } from "./AuthPages";
import { BoardPage } from "./BoardPage";

export function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontSize: 18,
          color: "#666",
        }}
      >
        Loading...
      </div>
    );
  }

  return isAuthenticated ? <BoardPage /> : <AuthPages />;
}
