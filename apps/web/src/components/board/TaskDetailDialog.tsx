import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Task } from "@/types";
import { client } from "@/api/client";

import { Loader2, Trash2, Send, MessageSquare, Flag, AlertCircle, Zap, Clock, ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskDetailDialogProps {
    taskId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TaskDetailDialog({ taskId, open, onOpenChange }: TaskDetailDialogProps) {
    const queryClient = useQueryClient();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<Task['priority']>("medium");
    const [newComment, setNewComment] = useState("");

    const { data: task, isLoading } = useQuery({
        queryKey: ["task", taskId],
        queryFn: async () => {
            if (!taskId) return null;
            const res = await client.get<{ task: Task }>(`/tasks/${taskId}`);
            return res.data.task;
        },
        enabled: !!taskId && open,
    });

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || "");
            setPriority(task.priority);
        }
    }, [task]);

    const updateTaskMutation = useMutation({
        mutationFn: async (data: Partial<Task>) => {
            await client.patch(`/tasks/${taskId}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["task", taskId] });
            queryClient.invalidateQueries({ queryKey: ["board"] }); // Refresh board to show updates
        }
    });

    const deleteTaskMutation = useMutation({
        mutationFn: async () => {
            await client.delete(`/tasks/${taskId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["board"] });
            onOpenChange(false);
        }
    })

    const addCommentMutation = useMutation({
        mutationFn: async (content: string) => {
            await client.post(`/tasks/${taskId}/comments`, { content });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["task", taskId] });
            setNewComment("");
        }
    })

    const deleteCommentMutation = useMutation({
        mutationFn: async (commentId: string) => {
            await client.delete(`/comments/${commentId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["task", taskId] });
        }
    })

    const handleSave = () => {
        updateTaskMutation.mutate({ title, description, priority });
    }

    if (!taskId) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto flex flex-col gap-0 p-0">
                <DialogHeader className="px-4 py-3 border-b border-border/50">
                    <DialogTitle className="text-base font-semibold">Task Details</DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <div className="text-center space-y-3">
                            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                            <p className="text-sm text-muted-foreground">Loading task details...</p>
                        </div>
                    </div>
                ) : task ? (
                    <div className="space-y-3 p-4">
                        {/* Title */}
                        <div className="space-y-1.5">
                            <Label htmlFor="title" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Task Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={handleSave}
                                className="text-base font-semibold border focus:border-primary/50 transition-smooth h-9"
                                placeholder="Enter task title..."
                            />
                        </div>

                        {/* Priority & Metadata */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="priority" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Flag className="w-3 h-3" />
                                    Priority
                                </Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between h-9 px-3 font-medium border hover:border-primary/50 transition-smooth text-sm"
                                        >
                                            <span className="flex items-center gap-2">
                                                {priority === 'high' && <><Zap className="w-3.5 h-3.5 text-[hsl(var(--priority-high))]" /> High</>}
                                                {priority === 'medium' && <><AlertCircle className="w-3.5 h-3.5 text-[hsl(var(--priority-medium))]" /> Medium</>}
                                                {priority === 'low' && <><Flag className="w-3.5 h-3.5 text-[hsl(var(--priority-low))]" /> Low</>}
                                            </span>
                                            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-40">
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setPriority("high");
                                                updateTaskMutation.mutate({ priority: "high" });
                                            }}
                                            className="cursor-pointer text-xs"
                                        >
                                            <Zap className="w-3.5 h-3.5 mr-2 text-[hsl(var(--priority-high))]" />
                                            High
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setPriority("medium");
                                                updateTaskMutation.mutate({ priority: "medium" });
                                            }}
                                            className="cursor-pointer text-xs"
                                        >
                                            <AlertCircle className="w-3.5 h-3.5 mr-2 text-[hsl(var(--priority-medium))]" />
                                            Medium
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setPriority("low");
                                                updateTaskMutation.mutate({ priority: "low" });
                                            }}
                                            className="cursor-pointer text-xs"
                                        >
                                            <Flag className="w-3.5 h-3.5 mr-2 text-[hsl(var(--priority-low))]" />
                                            Low
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" />
                                    Last Updated
                                </Label>
                                <div className="h-9 px-3 bg-muted/30 rounded-md border flex items-center gap-2">
                                    <span className="text-xs font-medium text-foreground/80">
                                        {new Date(task.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {new Date(task.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</Label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                onBlur={handleSave}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary/50 transition-smooth disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                placeholder="Add a detailed description..."
                            />
                        </div>

                        {/* Comments Section */}
                        <div className="space-y-3 pt-2">
                            <Separator className="my-2" />
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Activity & Comments
                                </h3>
                                <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full border">
                                    {task.comments?.length || 0}
                                </span>
                            </div>

                            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                {task.comments?.length === 0 && (
                                    <div className="text-center py-6">
                                        <div className="w-8 h-8 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center mb-2">
                                            <MessageSquare className="w-4 h-4 text-primary/60" />
                                        </div>
                                        <p className="text-xs font-medium text-muted-foreground">No comments yet</p>
                                    </div>
                                )}
                                {task.comments?.map((comment: any) => (
                                    <div key={comment.id} className="flex gap-2.5 p-2 rounded-lg hover:bg-muted/40 group transition-all border border-transparent hover:border-border/40">
                                        <Avatar className="h-7 w-7 ring-1 ring-border">
                                            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold text-[10px]">
                                                {(comment.user?.name || "U")[0].toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-semibold text-xs">{comment.user?.name || "Unknown User"}</span>
                                                    <span className="text-[10px] text-muted-foreground">•</span>
                                                    <span className="text-[10px] text-muted-foreground font-medium">
                                                        {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={() => deleteCommentMutation.mutate(comment.id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <p className="text-xs text-foreground/90 leading-relaxed bg-muted/30 rounded-md px-2.5 py-1.5">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2 pt-2 items-center">
                                <div className="flex-1">
                                    <Input
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Write a comment..."
                                        className="h-9 border focus:border-primary/50 transition-smooth text-sm"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                if (newComment.trim()) addCommentMutation.mutate(newComment);
                                            }
                                        }}
                                    />
                                </div>
                                <Button
                                    disabled={!newComment.trim() || addCommentMutation.isPending}
                                    onClick={() => addCommentMutation.mutate(newComment)}
                                    size="sm"
                                    className="h-9 px-4 shadow-sm font-medium"
                                >
                                    {addCommentMutation.isPending ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="h-3.5 w-3.5 mr-1.5" />
                                            Send
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 text-center text-destructive">Failed to load task details</div>
                )}

                <DialogFooter className="px-4 py-2 border-t border-border/50 flex-row sm:justify-between bg-muted/10 items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-smooth h-8 px-2 text-xs"
                        onClick={() => {
                            if (confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
                                deleteTaskMutation.mutate();
                            }
                        }}
                    >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Delete
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="hover:bg-muted transition-smooth h-8 px-4 text-xs"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
