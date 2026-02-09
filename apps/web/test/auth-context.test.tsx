import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { AuthProvider, useAuth } from "../src/lib/auth-context";

// Test component to access auth context
function TestComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? "authenticated" : "not-authenticated"}</div>
      {user && <div data-testid="user-email">{user.email}</div>}
      <button
        onClick={() => login({ id: 1, email: "test@example.com", name: "Test User" }, "test-token")}
      >
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  it("initializes as not authenticated", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId("auth-status")).toHaveTextContent("not-authenticated");
  });

  it("logs in user and stores in context", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("authenticated");
      expect(screen.getByTestId("user-email")).toHaveTextContent("test@example.com");
    });
  });

  it("logs out user and clears context", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Login first
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("authenticated");
    });

    // Then logout
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));
    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("not-authenticated");
    });
  });

  it("persists auth state in localStorage", async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith("auth_token", "test-token");
      expect(setItemSpy).toHaveBeenCalledWith(
        "auth_user",
        JSON.stringify({ id: 1, email: "test@example.com", name: "Test User" })
      );
    });

    setItemSpy.mockRestore();
  });

  it("clears localStorage on logout", async () => {
    const removeItemSpy = vi.spyOn(Storage.prototype, "removeItem");
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));

    await waitFor(() => {
      expect(removeItemSpy).toHaveBeenCalledWith("auth_token");
      expect(removeItemSpy).toHaveBeenCalledWith("auth_user");
    });

    removeItemSpy.mockRestore();
  });
});
