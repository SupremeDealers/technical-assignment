import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "../src/App";

describe("App", () => {
  it("renders title", () => {
    render(<App />);
    expect(screen.getByText(/Team Boards/i)).toBeInTheDocument();
  });
  it('renders board', () => {
  render(<Board />)
  expect(screen.getByText(/Board/i)).toBeInTheDocument()
})
});
