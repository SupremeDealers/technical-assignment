import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "../src/ui/App";

const qc = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

describe("App", () => {
  it("renders home page for unauthenticated users", () => {
    // Clear any stored auth
    localStorage.clear();
    render(
      <QueryClientProvider client={qc}>
        <App />
      </QueryClientProvider>
    );
    expect(screen.getByText("Start for Free →")).toBeInTheDocument();
  });
});
