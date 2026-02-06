import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "../src/ui/App";
import { AuthProvider } from "../src/AuthContext";

describe("App", () => {
  it("renders title", () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    expect(screen.getByText(/Team Boards/i)).toBeInTheDocument();
  });
});
