import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskCard } from "../src/components/TaskCard";

const mockTask = {
  id: 1,
  columnId: 1,
  title: "Test Task",
  description: "Task description",
  priority: "high",
  createdBy: { id: 1, name: "John Doe", email: "john@example.com" },
  assignedTo: { id: 2, name: "Jane Smith", email: "jane@example.com" },
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const mockColumns = [
  { id: 1, title: "To Do" },
  { id: 2, title: "In Progress" },
  { id: 3, title: "Done" },
];

describe("TaskCard", () => {
  it("renders task title and description", () => {
    const onTaskClick = vi.fn();
    const onMoveTask = vi.fn();

    render(
      <TaskCard
        task={mockTask}
        onTaskClick={onTaskClick}
        onMoveTask={onMoveTask}
        columns={mockColumns}
      />
    );

    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(screen.getByText("Task description")).toBeInTheDocument();
  });

  it("displays priority badge with correct color", () => {
    const onTaskClick = vi.fn();
    const onMoveTask = vi.fn();

    render(
      <TaskCard
        task={mockTask}
        onTaskClick={onTaskClick}
        onMoveTask={onMoveTask}
        columns={mockColumns}
      />
    );

    expect(screen.getByText("high")).toBeInTheDocument();
  });

  it("shows assigned user", () => {
    const onTaskClick = vi.fn();
    const onMoveTask = vi.fn();

    render(
      <TaskCard
        task={mockTask}
        onTaskClick={onTaskClick}
        onMoveTask={onMoveTask}
        columns={mockColumns}
      />
    );

    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("shows unassigned when no assignee", () => {
    const onTaskClick = vi.fn();
    const onMoveTask = vi.fn();
    const unassignedTask = { ...mockTask, assignedTo: null };

    render(
      <TaskCard
        task={unassignedTask}
        onTaskClick={onTaskClick}
        onMoveTask={onMoveTask}
        columns={mockColumns}
      />
    );

    expect(screen.getByText("Unassigned")).toBeInTheDocument();
  });

  it("calls onTaskClick when card is clicked", async () => {
    const onTaskClick = vi.fn();
    const onMoveTask = vi.fn();

    render(
      <TaskCard
        task={mockTask}
        onTaskClick={onTaskClick}
        onMoveTask={onMoveTask}
        columns={mockColumns}
      />
    );

    fireEvent.click(screen.getByText("Test Task"));

    expect(onTaskClick).toHaveBeenCalledWith(mockTask);
  });

  it("calls onMoveTask when column is changed", async () => {
    const onTaskClick = vi.fn();
    const onMoveTask = vi.fn();

    render(
      <TaskCard
        task={mockTask}
        onTaskClick={onTaskClick}
        onMoveTask={onMoveTask}
        columns={mockColumns}
      />
    );

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "2" } });

    expect(onMoveTask).toHaveBeenCalledWith(1, 2);
  });

  it("renders all column options in dropdown", () => {
    const onTaskClick = vi.fn();
    const onMoveTask = vi.fn();

    render(
      <TaskCard
        task={mockTask}
        onTaskClick={onTaskClick}
        onMoveTask={onMoveTask}
        columns={mockColumns}
      />
    );

    const select = screen.getByRole("combobox");
    const options = within(select as HTMLElement).getAllByRole("option");

    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent("To Do");
    expect(options[1]).toHaveTextContent("In Progress");
    expect(options[2]).toHaveTextContent("Done");
  });
});

// Helper function from testing-library
function within(element: HTMLElement) {
  return {
    getAllByRole: (role: string) => {
      const elements = element.querySelectorAll(`[role="${role}"], ${role}`);
      return Array.from(elements) as HTMLElement[];
    },
  };
}
