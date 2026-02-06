import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthPage } from "../src/pages/AuthPage";
import { AuthContext } from "../src/auth/context";
import { authAPI } from "../src/api/client";
import { BrowserRouter } from "react-router-dom";

// Mock the authAPI
vi.mock("../src/api/client", () => ({
  authAPI: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe("AuthPage", () => {
  it("renders login form by default", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={{ 
          user: null, 
          login: vi.fn(), 
          logout: vi.fn(), 
          token: null, 
          isAuthenticated: false 
        }}>
          <BrowserRouter>
            <AuthPage />
          </BrowserRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );

    const loginTitle = screen.getByRole("heading", { name: /Sign In/i });
    expect(loginTitle).toBeInTheDocument();
  });

  it("renders register form when register link is clicked", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={{ 
          user: null, 
          login: vi.fn(), 
          logout: vi.fn(), 
          token: null, 
          isAuthenticated: false 
        }}>
          <BrowserRouter>
            <AuthPage />
          </BrowserRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );

    const registerLink = screen.getByText(/Sign Up/i);
    fireEvent.click(registerLink);

    const registerTitle = screen.getByRole("heading", { name: /Create Account/i });
    expect(registerTitle).toBeInTheDocument();
  });

  it("renders login form when login link is clicked from register form", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={{ 
          user: null, 
          login: vi.fn(), 
          logout: vi.fn(), 
          token: null, 
          isAuthenticated: false 
        }}>
          <BrowserRouter>
            <AuthPage />
          </BrowserRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );

    // Go to register form
    const registerLink = screen.getByText(/Sign Up/i);
    fireEvent.click(registerLink);

    // Go back to login form
    const loginLink = screen.getByText(/Sign In/i);
    fireEvent.click(loginLink);

    const loginTitle = screen.getByRole("heading", { name: /Sign In/i });
    expect(loginTitle).toBeInTheDocument();
  });

  it("calls login API with correct values when login form is submitted", async () => {
    const mockLogin = vi.fn().mockResolvedValue({
      user: { id: 1, email: "test@example.com", name: "Test User" },
      token: "test-token",
    });
    (authAPI.login as any) = mockLogin;

    const mockAuthLogin = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={{ 
          user: null, 
          login: mockAuthLogin, 
          logout: vi.fn(), 
          token: null, 
          isAuthenticated: false 
        }}>
          <BrowserRouter>
            <AuthPage />
          </BrowserRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );

    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const loginButton = screen.getByRole("button", { name: /Sign In/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  it("calls register API with correct values when register form is submitted", async () => {
    const mockRegister = vi.fn().mockResolvedValue({
      user: { id: 1, email: "test@example.com", name: "Test User" },
      token: "test-token",
    });
    (authAPI.register as any) = mockRegister;

    const mockAuthLogin = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={{ 
          user: null, 
          login: mockAuthLogin, 
          logout: vi.fn(), 
          token: null, 
          isAuthenticated: false 
        }}>
          <BrowserRouter>
            <AuthPage />
          </BrowserRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );

    // Go to register form
    const registerLink = screen.getByText(/Sign Up/i);
    fireEvent.click(registerLink);

    const nameInput = screen.getByPlaceholderText(/John Doe/i);
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const registerButton = screen.getByRole("button", { name: /Create Account/i });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });
    });
  });
});
