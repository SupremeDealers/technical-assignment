import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../src/context/AuthContext";
import { App } from "../src/ui/App";

describe("App", () => {
  it("renders title", () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>,
    );
    expect(screen.getByText(/Team Boards/i)).toBeInTheDocument();
  });
});
