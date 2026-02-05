import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../src/auth/context";
import { App } from "../src/App";

const queryClient = new QueryClient();

describe("ProtectedRoute", () => {
  it("redirects to login when visiting / without auth", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/"]}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
  });

  it("redirects unknown path to /", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/unknown"]}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
  });
});
