import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../src/auth/context";
import { Login } from "../src/pages/Login";

const queryClient = new QueryClient();

function renderLogin() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("Login", () => {
  it("renders sign in title and Team Boards subtitle", () => {
    renderLogin();
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText("Team Boards")).toBeInTheDocument();
  });

  it("renders email and password inputs", () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("renders sign in button", () => {
    renderLogin();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders link to register", () => {
    renderLogin();
    const link = screen.getByRole("link", { name: /register/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/register");
  });
});
