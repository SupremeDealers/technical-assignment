import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { App } from "../src/ui/App";
import { AuthProvider } from "../src/auth";

describe("App", () => {
  it("renders title", () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <AuthProvider>
          <MemoryRouter initialEntries={["/"]}>
            <App />
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    );
    const teamBoardsElements = screen.getAllByText(/TeamBoards/i);
    expect(teamBoardsElements.length).toBeGreaterThan(0);
  });
});
