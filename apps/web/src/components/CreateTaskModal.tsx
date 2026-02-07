import { useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, type Task } from "../lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { NativeSelect } from "./ui/native-select";
import { toast } from "sonner";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  priority: z.enum(["low", "medium", "high"]),
  columnId: z.number().min(1, "Please select a column"),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface CreateTaskModalProps {
  editTask?: Task;
  onClose: () => void;
}

const BOARD_ID = 1;

export function CreateTaskModal({ editTask, onClose }: CreateTaskModalProps) {
  const queryClient = useQueryClient();

  const { data: columns = [] } = useQuery({
    queryKey: ["columns", BOARD_ID],
    queryFn: () => api.getBoardColumns(BOARD_ID),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: editTask?.title || "",
      description: editTask?.description || "",
      priority: editTask?.priority || "medium",
      columnId: editTask?.columnId || 0,
    },
  });

  const selectedColumnId = watch("columnId");

  useEffect(() => {
    if (columns.length > 0 && selectedColumnId === 0) {
      setValue("columnId", columns[0].id);
    }
  }, [columns, selectedColumnId, setValue]);

  const createMutation = useMutation({
    mutationFn: (data: TaskFormData) =>
      api.createTask(data.columnId, {
        title: data.title,
        description: data.description,
        priority: data.priority,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["columns"] });
      toast.success("Task created successfully!");
      onClose();
    },
    onError: () => {
      toast.error("Failed to create task. Please try again.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: TaskFormData) =>
      api.updateTask(editTask!.id, {
        title: data.title,
        description: data.description,
        priority: data.priority,
        columnId: data.columnId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["columns"] });
      toast.success("Task updated successfully!");
      onClose();
    },
    onError: () => {
      toast.error("Failed to update task. Please try again.");
    },
  });

  const onSubmit = (data: TaskFormData) => {
    if (editTask) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{editTask ? "Edit Task" : "Create New Task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="column">
              Column <span className="text-destructive">*</span>
            </Label>
            <NativeSelect
              id="column"
              {...register("columnId", { valueAsNumber: true })}
              className={errors.columnId ? "border-destructive" : ""}
            >
              {columns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.name}
                </option>
              ))}
            </NativeSelect>
            {errors.columnId && (
              <p className="text-sm text-destructive">{errors.columnId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter task title..."
              {...register("title")}
              className={errors.title ? "border-destructive" : ""}
              autoFocus
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add task description..."
              rows={4}
              {...register("description")}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <NativeSelect
              id="priority"
              {...register("priority")}
              className={errors.priority ? "border-destructive" : ""}
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </NativeSelect>
            {errors.priority && (
              <p className="text-sm text-destructive">{errors.priority.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : editTask ? "Update Task" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
