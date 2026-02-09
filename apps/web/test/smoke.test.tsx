import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "../src/ui/App";

describe("App", () => {
  it("renders title", () => {
    render(<App />);
    expect(screen.getByText(/Monochrome Kanban/i)).toBeInTheDocument();
  });
});
