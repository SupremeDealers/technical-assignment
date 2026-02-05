import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TaskCard } from "../src/components/TaskCard";
import type { Task } from "../src/types";

const mockTask: Task = {
  id: 1,
  columnId: 10,
  title: "Test task title",
  description: "Test description",
  priority: "high",
  position: 0,
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-02T00:00:00Z",
  creatorName: "Alice",
};

function renderTaskCard(task: Task = mockTask, isDraggable = true) {
  return render(
    <DndProvider backend={HTML5Backend}>
      <TaskCard task={task} onClick={() => {}} isDraggable={isDraggable} />
    </DndProvider>
  );
}

describe("TaskCard", () => {
  it("renders task title", () => {
    renderTaskCard();
    expect(screen.getByText("Test task title")).toBeInTheDocument();
  });

  it("renders creator name when present", () => {
    renderTaskCard();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders without creator name when null", () => {
    renderTaskCard({ ...mockTask, creatorName: null });
    expect(screen.getByText("Test task title")).toBeInTheDocument();
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
  });

  it("has accessible label for opening task", () => {
    renderTaskCard();
    expect(screen.getByRole("button", { name: /open task: test task title/i })).toBeInTheDocument();
  });
});
