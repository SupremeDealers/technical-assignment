import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "../src/ui/App";

describe("App", () => {
  it("renders login page by default", () => {
    render(<App />);
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });
});
