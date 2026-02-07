import React from "react";
import { X } from "lucide-react";
import type { Column } from "../types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { getColumnIcon, getColumnIconColor } from "../lib/column-icons";

type Props = {
  open: boolean;
  columns: Column[];
  defaultColumnId?: string;
  onClose: () => void;
  onCreate: (columnId: string, payload: { title: string; description?: string; priority?: number }) => void;
};

const priorityOptions = [
  { value: "1", label: "Low" },
  { value: "2", label: "Medium-Low" },
  { value: "3", label: "Medium" },
  { value: "4", label: "High" },
  { value: "5", label: "Critical" },
];

export function CreateTaskDrawer({ open, columns, defaultColumnId, onClose, onCreate }: Props) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState("1");
  const [columnId, setColumnId] = React.useState(defaultColumnId ?? columns[0]?.id ?? "");

  React.useEffect(() => {
    if (defaultColumnId) {
      setColumnId(defaultColumnId);
    }
  }, [defaultColumnId]);

  React.useEffect(() => {
    if (open && !columnId && columns.length > 0) {
      setColumnId(columns[0].id);
    }
  }, [open, columnId, columns]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !columnId) return;
    onCreate(columnId, {
      title: title.trim(),
      description: description.trim() || undefined,
      priority: Number(priority) || 1,
    });
    setTitle("");
    setDescription("");
    setPriority("1");
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col" showCloseButton={false}>
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-heading text-lg">Create New Task</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <form onSubmit={handleCreate} className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-column">Column</Label>
              <Select value={columnId} onValueChange={setColumnId}>
                <SelectTrigger id="create-column">
                  <SelectValue placeholder="Select a column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => {
                    const ColumnIcon = getColumnIcon(col.title);
                    const iconColor = getColumnIconColor(col.title);
                    return (
                      <SelectItem key={col.id} value={col.id}>
                        <div className="flex items-center gap-2">
                          <ColumnIcon className={`h-4 w-4 ${iconColor}`} />
                          {col.title}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-title">Title</Label>
              <Input
                id="create-title"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                placeholder="Add more details about this task..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="create-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">
                Create Task
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
