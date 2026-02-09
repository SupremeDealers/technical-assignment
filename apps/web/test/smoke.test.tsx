import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("../src/contexts/AuthContext", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: null,
    token: null,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
}));

import { LoginPage } from "../src/pages/auth/LoginPage";
import { RegisterPage } from "../src/pages/auth/RegisterPage";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe("LoginPage", () => {
  it("renders login form", () => {
    renderWithProviders(<LoginPage />);
    
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign in/i })).toBeInTheDocument();
  });

  it("has link to register page", () => {
    renderWithProviders(<LoginPage />);
    
    expect(screen.getByText(/Don't have an account/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Sign up/i })).toHaveAttribute("href", "/register");
  });

  it("shows demo credentials", () => {
    renderWithProviders(<LoginPage />);
    
    expect(screen.getByText(/Demo credentials/i)).toBeInTheDocument();
    expect(screen.getByText(/alice@example.com/i)).toBeInTheDocument();
  });
});

describe("RegisterPage", () => {
  it("renders registration form", () => {
    renderWithProviders(<RegisterPage />);
    
    expect(screen.getByRole("heading", { name: /Create account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create account/i })).toBeInTheDocument();
  });

  it("has link to login page", () => {
    renderWithProviders(<RegisterPage />);
    
    expect(screen.getByText(/Already have an account/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Sign in/i })).toHaveAttribute("href", "/login");
  });
});
