import { describe, it, expect } from "vitest";
import { render, screen } from "./utils"; // Use custom render
import { AppRoutes } from "../src/ui/App"; 

// Mock matchMedia (Required for some UI libraries)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: any) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, 
    removeListener: () => {}, 
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

describe("App Integration", () => {
  it("renders the Login Screen by default", () => {
    render(<AppRoutes />);
    expect(screen.getByText(/Task Management/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password|••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it("shows Register toggle option", () => {
    render(<AppRoutes />);
    expect(screen.getByText(/Need an account|Register/i)).toBeInTheDocument();
  });
});