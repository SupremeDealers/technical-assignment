import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "../src/components/Header";
import { MemoryRouter } from "react-router-dom";

//Mock the Auth Context
const mockUser = {
  id: "123",
  name: "Test Admin",
  email: "admin@test.com",
  role: "admin"
};

const mockLogout = vi.fn();

vi.mock("../src/context/AuthContext", () => ({
  useAuth: () => ({
    user: mockUser,
    logoutUser: mockLogout,
    isLoading: false,
  }),
}));

describe("Header Component", () => {
  it("displays the logged-in user's name", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    //Check Name
    expect(screen.getByText("Test Admin")).toBeInTheDocument();
    
    //Check Role Badge
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("shows Admin 'Manipulate Board' button for admins", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText("Manipulate Board")).toBeInTheDocument();
  });

  it("renders the Logo", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByText(/Task Management/i)).toBeInTheDocument();
  });
});