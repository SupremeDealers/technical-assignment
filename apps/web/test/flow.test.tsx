import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { App } from "../src/ui/App";
import { AuthProvider } from "../src/auth";

const jsonResponse = (data: unknown) =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: async () => data,
  } as Response);

describe("app flow", () => {
  it("logs in and renders the board", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/auth/login")) {
        return jsonResponse({
          user: { id: "u1", name: "Demo", email: "demo@example.com" },
          boardId: "b1",
        });
      }
      if (url.includes("/boards/b1/columns")) {
        return jsonResponse([
          { id: "c1", title: "Todo", order: 1, taskCount: 0 },
        ]);
      }
      if (url.includes("/boards/b1")) {
        return jsonResponse({ id: "b1", title: "Demo Board" });
      }
      if (url.includes("/columns/c1/tasks")) {
        return jsonResponse({ items: [], page: 1, limit: 5, total: 0, totalPages: 0 });
      }
      return jsonResponse({});
    });

    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <AuthProvider>
          <MemoryRouter initialEntries={["/login"]}>
            <App />
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "demo@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Demo Board")).toBeInTheDocument();
    });
  });
});
