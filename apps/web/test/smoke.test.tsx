import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../src/contexts/AuthContext";
import { LoginPage } from "../src/pages/LoginPage";

const qc = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

describe("App", () => {
  it("renders login page", () => {
    render(
      <QueryClientProvider client={qc}>
        <AuthProvider>
          <BrowserRouter>
            <LoginPage />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    );
    expect(screen.getByText(/Team Boards/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument();
  });
});
