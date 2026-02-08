import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "../src/ui/App";
import { AuthProvider } from "../src/hooks/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const qc = new QueryClient();

describe("App", () => {
  it("renders login by default", () => {
    render(
      <QueryClientProvider client={qc}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    );
    expect(screen.getAllByText(/Sign In/i)[0]).toBeInTheDocument();
  });
});
