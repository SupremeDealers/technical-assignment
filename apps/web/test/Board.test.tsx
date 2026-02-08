import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BoardView from "../src/components/BoardView";
import * as boardApi from "../src/api/board.api";

vi.spyOn(boardApi, "getColumns").mockResolvedValue([
  { id: 1, name: "Todo", tasksCount: 2 },
  { id: 2, name: "In Progress", tasksCount: 0 },
  { id: 3, name: "Done", tasksCount: 1 },
]);

describe("BoardView", () => {
  it("renders board columns", async () => {
    render(<BoardView boardId={1} />);

    expect(await screen.findByText(/Todo/i)).toBeInTheDocument();
    expect(await screen.findByText(/In Progress/i)).toBeInTheDocument();
    expect(await screen.findByText(/Done/i)).toBeInTheDocument();
  });
});
