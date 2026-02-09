import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { BoardListPage } from "../pages/BoardListPage";
import { Spinner } from "../components/Spinner";

export function App() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<"login" | "register">("login");

  // Update body class based on current page
  useEffect(() => {
    if (isLoading) {
      document.body.className = "";
    } else if (!user) {
      document.body.className = "auth-page";
    } else {
      document.body.className = "board-page";
    }
  }, [user, isLoading]);

  if (isLoading) {
    return <Spinner />;
  }

  if (!user) {
    return (
      <>
        {currentPage === "login" ? (
          <LoginPage onSwitchToRegister={() => setCurrentPage("register")} />
        ) : (
          <RegisterPage onSwitchToLogin={() => setCurrentPage("login")} />
        )}
      </>
    );
  }

  return <BoardListPage />;
}
