import { Search, Plus } from "lucide-react";
import type { Board } from "../../types";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

type BoardHeaderProps = {
  board: Board;
  search: string;
  onSearchChange: (value: string) => void;
  onAddTask: () => void;
};

export function BoardHeader({ board, search, onSearchChange, onAddTask }: BoardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">{board.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage and track your project tasks
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={onAddTask} size="default" className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9"
            aria-label="Search tasks"
          />
        </div>
      </div>
    </div>
  );
}
