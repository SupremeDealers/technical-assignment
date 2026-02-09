import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "../src/ui/App";
import { AuthProvider } from "../src/lib/auth-context";

// Create test wrapper with all necessary providers
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

describe("App", () => {
  it("renders login page for unauthenticated users", () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    // Should redirect to login page
    expect(screen.getByText(/Team Boards/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("shows demo credentials on login page", () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    expect(screen.getByText(/Demo credentials:/i)).toBeInTheDocument();
    expect(screen.getByText(/alice@example.com/i)).toBeInTheDocument();
  });

  it("has link to registration page", () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
  });
});
