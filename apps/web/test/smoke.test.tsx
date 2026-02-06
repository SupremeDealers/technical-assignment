import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "../src/ui/App";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe("App", () => {
  it("renders login screen initially", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    // Check for the h1 element with "Sign In" text
    const signInTitle = screen.getByRole("heading", { name: /Sign In/i });
    expect(signInTitle).toBeInTheDocument();
    expect(signInTitle.tagName).toBe("H1");
  });
});
