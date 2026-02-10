import { useMemo, useState, useRef, useEffect } from "react";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Column, Task } from "@/types";
import { TaskCard } from "./TaskCard";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Trash2, Sparkles, GripVertical, Pencil } from "lucide-react";

interface BoardColumnProps {
    column: Column;
    tasks: Task[];
    onAddTask: (columnId: string) => void;
    onTaskClick: (task: Task) => void;
    onDeleteColumn: (columnId: string) => void;
    onUpdateColumn: (columnId: string, name: string) => void;
}

export function BoardColumn({ column, tasks, onAddTask, onTaskClick, onDeleteColumn, onUpdateColumn }: BoardColumnProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(column.name);
    const inputRef = useRef<HTMLInputElement>(null);
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
    });

    // Smooth transitions - disable during active dragging to prevent jitter
    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isDragging
            ? undefined
            : transition || 'transform 150ms cubic-bezier(0.25, 0.1, 0.25, 1)',
    };

    const colorVariance = useMemo(() => {
        const variants = [
            "bg-blue-50/30 border-blue-100/50",
            "bg-purple-50/30 border-purple-100/50",
            "bg-emerald-50/30 border-emerald-100/50",
            "bg-indigo-50/30 border-indigo-100/50",
            "bg-rose-50/30 border-rose-100/50",
            "bg-amber-50/30 border-amber-100/50",
            "bg-cyan-50/30 border-cyan-100/50",
            "bg-teal-50/30 border-teal-100/50",
        ];
        let hash = 0;
        for (let i = 0; i < column.id.length; i++) {
            hash = column.id.charCodeAt(i) + ((hash << 5) - hash);
        }
        return variants[Math.abs(hash) % variants.length];
    }, [column.id]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (editName.trim() && editName !== column.name) {
            onUpdateColumn(column.id, editName);
        } else {
            setEditName(column.name);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSave();
        } else if (e.key === "Escape") {
            setEditName(column.name);
            setIsEditing(false);
        }
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="w-[300px] h-[500px] bg-primary/5 opacity-40 border-2 border-dashed border-primary/40 rounded-lg flex-shrink-0"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn("w-[280px] flex flex-col gap-2 h-full flex-shrink-0")}
        >
            {/* Column Header */}
            <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
                <div
                    {...attributes}
                    {...listeners}
                    className="flex items-center justify-between p-2.5 cursor-grab active:cursor-grabbing hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all group/header"
                >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <GripVertical className="w-3 h-3 text-muted-foreground opacity-0 group-hover/header:opacity-100 transition-opacity flex-shrink-0" />
                        <div className="w-1 h-5 bg-gradient-to-b from-primary to-accent rounded-full flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                            {isEditing ? (
                                <Input
                                    ref={inputRef}
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onBlur={handleSave}
                                    onKeyDown={handleKeyDown}
                                    className="h-6 py-0 px-1 text-[13px] font-bold tracking-tight border-none focus-visible:ring-1 focus-visible:ring-primary/50 bg-background/50"
                                />
                            ) : (
                                <>
                                    <h3
                                        className="font-bold text-[13px] tracking-tight truncate cursor-pointer hover:underline decoration-dashed underline-offset-2 decoration-muted-foreground/50"
                                        onDoubleClick={() => setIsEditing(true)}
                                    >
                                        {column.name}
                                    </h3>
                                    <p className="text-[11px] text-muted-foreground font-medium">
                                        {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                    <div onPointerDown={(e) => e.stopPropagation()} className="flex-shrink-0">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-primary/10 hover:text-primary transition-all">
                                    <MoreHorizontal className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                                <DropdownMenuItem
                                    className="cursor-pointer text-xs"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <Pencil className="mr-2 h-3 w-3" />
                                    Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer text-xs"
                                    onClick={() => {
                                        if (confirm("Are you sure you want to delete this column?")) {
                                            onDeleteColumn(column.id);
                                        }
                                    }}
                                >
                                    <Trash2 className="mr-2 h-3 w-3" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Tasks Container */}
            <div className={cn("flex-1 flex flex-col gap-2 min-h-[180px] max-h-[calc(100vh-15rem)] rounded-xl p-2 border transition-colors", colorVariance)}>
                {/* Add Task Button */}
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-card h-auto py-2 border border-dashed border-border/50 hover:border-primary/40 hover:shadow-sm transition-all rounded-lg font-medium flex-shrink-0 text-xs"
                    onClick={() => onAddTask(column.id)}
                >
                    <Plus className="mr-1.5 h-3 w-3" />
                    Add Task
                </Button>

                {/* Scrollable tasks area */}
                <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-0.5 custom-scrollbar">
                    <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                        {tasks.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center py-8">
                                <div className="text-center space-y-2">
                                    <div className="w-10 h-10 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-primary/50" />
                                    </div>
                                    <p className="text-[11px] font-medium text-muted-foreground">No tasks yet</p>
                                </div>
                            </div>
                        ) : (
                            tasks.map((task) => (
                                <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
                            ))
                        )}
                    </SortableContext>
                </div>
            </div>
        </div>
    );
}
