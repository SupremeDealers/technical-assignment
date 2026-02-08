import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../src/context/AuthContext";
import { App } from "../src/App";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function renderApp(route = "/login") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe("App", () => {
  it("renders login page by default for unauthenticated users", () => {
    renderApp("/login");
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign in to continue to Team Boards/i)).toBeInTheDocument();
  });

  it("renders register page", () => {
    renderApp("/register");
    expect(screen.getByRole("heading", { name: /Create account/i })).toBeInTheDocument();
    expect(screen.getByText(/Get started with Team Boards/i)).toBeInTheDocument();
  });
});
