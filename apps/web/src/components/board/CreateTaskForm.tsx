import React from "react";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

type CreateTaskFormProps = {
  onCreateTask: (payload: { title: string; description?: string }) => void;
  isLoading?: boolean;
};

export function CreateTaskForm({ onCreateTask, isLoading }: CreateTaskFormProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreateTask({
      title: title.trim(),
      description: description.trim() || undefined,
    });
    setTitle("");
    setDescription("");
    setIsOpen(false);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-3">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
          Add task
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <form onSubmit={onSubmit} className="space-y-3 p-3 bg-card rounded-lg border">
          <div className="space-y-1.5">
            <Label htmlFor="task-title" className="text-xs">
              Title
            </Label>
            <Input
              id="task-title"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-8 text-sm"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-description" className="text-xs">
              Description (optional)
            </Label>
            <Textarea
              id="task-description"
              placeholder="Add more details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="text-sm resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add task"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CollapsibleContent>
    </Collapsible>
  );
}
