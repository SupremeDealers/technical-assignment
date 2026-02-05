import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../src/auth/context";
import { Register } from "../src/pages/Register";

const queryClient = new QueryClient();

function renderRegister() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("Register", () => {
  it("renders create account title and Team Boards subtitle", () => {
    renderRegister();
    expect(screen.getByRole("heading", { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByText("Team Boards")).toBeInTheDocument();
  });

  it("renders name, email and password inputs", () => {
    renderRegister();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("renders password hint", () => {
    renderRegister();
    expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
  });

  it("renders create account button", () => {
    renderRegister();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("renders link to login", () => {
    renderRegister();
    const link = screen.getByRole("link", { name: /sign in/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/login");
  });
});
