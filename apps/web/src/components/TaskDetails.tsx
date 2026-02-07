import React from "react";
import { Loader2, MessageSquare, Send, X } from "lucide-react";
import type { Task } from "../types";
import { useComments, useCommentMutations } from "../queries";
import { ErrorState, LoadingState, EmptyState } from "./States";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type Props = {
  task: Task | null;
  onUpdate: (taskId: string, payload: { title?: string; description?: string; priority?: number }) => void;
  onClose: () => void;
};

const priorityOptions = [
  { value: "1", label: "Low" },
  { value: "2", label: "Medium-Low" },
  { value: "3", label: "Medium" },
  { value: "4", label: "High" },
  { value: "5", label: "Critical" },
];

export function TaskDetails({ task, onUpdate, onClose }: Props) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState("1");
  const [commentBody, setCommentBody] = React.useState("");

  const commentsQuery = useComments(task?.id ?? "");
  const addComment = useCommentMutations(task?.id ?? "");

  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setPriority(String(task.priority ?? 1));
    }
  }, [task]);

  const handleSave = () => {
    if (!task || !title.trim()) return;
    onUpdate(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      priority: Number(priority) || 1,
    });
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    await addComment.mutateAsync({ body: commentBody.trim() });
    setCommentBody("");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sheet open={!!task} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col" showCloseButton={false}>
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-heading text-lg">Task Details</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="px-6 py-4 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="detail-title">Title</Label>
              <Input
                id="detail-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="detail-description">Description</Label>
              <Textarea
                id="detail-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Add more details about this task..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="detail-priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="detail-priority">
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

            <Button onClick={handleSave} className="w-full">
              Save changes
            </Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-heading font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments
            </h4>

            {commentsQuery.isLoading ? (
              <LoadingState label="Loading comments..." size="sm" />
            ) : null}
            {commentsQuery.error ? (
              <ErrorState message={(commentsQuery.error as Error).message} />
            ) : null}

            {!commentsQuery.isLoading && !commentsQuery.error ? (
              (commentsQuery.data?.length ?? 0) === 0 ? (
                <EmptyState message="No comments yet. Be the first to add one!" className="py-6" />
              ) : (
                <div className="space-y-4">
                  {commentsQuery.data?.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials(comment.author?.name ?? "U")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-medium">
                            {comment.author?.name ?? "Unknown"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{comment.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : null}

            <form onSubmit={handleAddComment} className="flex gap-2">
              <Input
                placeholder="Add a comment..."
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={addComment.isPending}>
                {addComment.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
