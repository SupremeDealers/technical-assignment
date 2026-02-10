import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardTitle } from "@/components/ui/card";
import { MessageSquare, Flag, AlertCircle, Zap, ChevronDown } from "lucide-react";
import { Task } from "@/types";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/api/client";
import { toast } from "sonner";

interface TaskCardProps {
    task: Task;
    onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
    const queryClient = useQueryClient();
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task,
        },
    });

    // Smooth transitions - disable during active dragging to prevent jitter
    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isDragging
            ? undefined
            : transition || 'transform 150ms cubic-bezier(0.25, 0.1, 0.25, 1)',
    };

    const updatePriorityMutation = useMutation({
        mutationFn: async (priority: Task['priority']) => {
            await client.patch(`/tasks/${task.id}`, { priority });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["board"] });
            toast.success("Priority updated");
        },
        onError: () => {
            toast.error("Failed to update priority");
        }
    });

    const priorityConfig = {
        low: {
            bg: "bg-[hsl(var(--priority-low-bg))]",
            text: "text-[hsl(var(--priority-low))]",
            border: "border-[hsl(var(--priority-low-border))]",
            icon: Flag,
            label: "Low"
        },
        medium: {
            bg: "bg-[hsl(var(--priority-medium-bg))]",
            text: "text-[hsl(var(--priority-medium))]",
            border: "border-[hsl(var(--priority-medium-border))]",
            icon: AlertCircle,
            label: "Medium"
        },
        high: {
            bg: "bg-[hsl(var(--priority-high-bg))]",
            text: "text-[hsl(var(--priority-high))]",
            border: "border-[hsl(var(--priority-high-border))]",
            icon: Zap,
            label: "High"
        },
    };

    const config = priorityConfig[task.priority];
    const PriorityIcon = config.icon;

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-25 bg-primary/5 h-[72px] border-2 border-dashed border-primary/30 rounded-md"
            />
        );
    }

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "cursor-grab active:cursor-grabbing group",
                "hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5",
                "transition-all duration-150",
                "bg-card border-border/40 shadow-sm"
            )}
        >
            <div onClick={onClick} className="p-2.5 space-y-2">
                <CardTitle className="text-[13px] font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {task.title}
                </CardTitle>

                <div className="flex items-center justify-between gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            className={cn(
                                "flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[11px] font-semibold outline-none",
                                "hover:opacity-80 transition-opacity",
                                config.bg,
                                config.text,
                                config.border
                            )}
                        >
                            <PriorityIcon className="w-2.5 h-2.5" />
                            <span>{config.label}</span>
                            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-36">
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    updatePriorityMutation.mutate('high');
                                }}
                                className="cursor-pointer text-xs"
                            >
                                <Zap className="w-3 h-3 mr-2 text-[hsl(var(--priority-high))]" />
                                High
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    updatePriorityMutation.mutate('medium');
                                }}
                                className="cursor-pointer text-xs"
                            >
                                <AlertCircle className="w-3 h-3 mr-2 text-[hsl(var(--priority-medium))]" />
                                Medium
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    updatePriorityMutation.mutate('low');
                                }}
                                className="cursor-pointer text-xs"
                            >
                                <Flag className="w-3 h-3 mr-2 text-[hsl(var(--priority-low))]" />
                                Low
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {task._count && task._count.comments > 0 && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">
                            <MessageSquare className="w-2.5 h-2.5" />
                            <span className="text-[10px] font-medium">{task._count.comments}</span>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
