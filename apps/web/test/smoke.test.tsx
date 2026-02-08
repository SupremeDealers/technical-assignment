import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { App } from "../src/App";
import { router } from "../src/routes";
import * as tasksApi from "../src/api/tasks";

vi.mock("../src/api/tasks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/api/tasks")>();
  return {
    ...actual,
    getMyBoard: vi.fn(),
    getTasks: vi.fn(),
    getTask: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  };
});

vi.mock("../src/api/comments", () => {
  return {
    getComments: vi.fn(),
    createComment: vi.fn(),
  };
});

const mockedTasksApi = tasksApi as unknown as {
  getMyBoard: ReturnType<typeof vi.fn>;
  getTasks: ReturnType<typeof vi.fn>;
  getTask: ReturnType<typeof vi.fn>;
  createTask: ReturnType<typeof vi.fn>;
  updateTask: ReturnType<typeof vi.fn>;
  deleteTask: ReturnType<typeof vi.fn>;
};

const renderApp = () => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={qc}>
      <App />
    </QueryClientProvider>,
  );
};

describe("App routing", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    window.history.pushState({}, "", "/");
  });

  it("redirects to login when unauthenticated", async () => {
    renderApp();
    expect(
      await screen.findByRole("heading", { name: /login/i }),
    ).toBeInTheDocument();
  });

  it("renders board when authenticated", async () => {
    window.history.pushState({}, "", "/");

    localStorage.setItem("token", "test-token");
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 1, email: "demo@example.com" }),
    );

    mockedTasksApi.getMyBoard.mockResolvedValue({
      id: 1,
      name: "Test Board",
      columns: [
        { id: 11, title: "To Do", boardId: 1, order: 0 },
        { id: 12, title: "In Progress", boardId: 1, order: 1 },
      ],
    });

    mockedTasksApi.getTasks.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    await router.navigate("/");
    renderApp();

    expect(await screen.findByText("Test Board")).toBeInTheDocument();
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("renders task details route when authenticated", async () => {
    localStorage.setItem("token", "test-token");
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 1, email: "demo@example.com" }),
    );

    mockedTasksApi.getMyBoard.mockResolvedValue({
      id: 1,
      name: "Test Board",
      columns: [{ id: 11, title: "To Do", boardId: 1, order: 0 }],
    });

    mockedTasksApi.getTasks.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    mockedTasksApi.getTask.mockResolvedValue({
      id: 123,
      columnId: 11,
      title: "Task 123",
      description: "Desc",
      priority: "MEDIUM",
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const commentsApi = await import("../src/api/comments");
    (commentsApi.getComments as any).mockResolvedValue([]);

    await router.navigate("/tasks/123");
    renderApp();

    expect(await screen.findByText("Task 123")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Comments" })).toBeInTheDocument();
  });
});
