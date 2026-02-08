import React, { useState, useEffect } from "react";
import Modal from "../Modal";
import {
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useGetTask,
  useBoardDetails,
} from "../../../store/services/board.service";
import { useSearchParams } from "react-router-dom";
import { Input } from "../../Input";
import { showToast } from "../../tools/toast";
import { PRIORITY_ENUM } from "../../../types";

type Props = {
  onClose: () => void;
};

const HandleTask = ({ onClose }: Props) => {
  const [searchParams] = useSearchParams();
  const boardId = searchParams.get("ref") || searchParams.get("board_id") || "";
  const columnIdParam = searchParams.get("column_id") || "";
  const taskId = searchParams.get("task_id") || "";

  // Task fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<PRIORITY_ENUM>(PRIORITY_ENUM.MEDIUM);
  const [columnId, setColumnId] = useState(columnIdParam);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  // Data hooks
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const { data: taskData, isLoading: isTaskLoading } = useGetTask(taskId);
  const { data: boardDetails, isLoading: isBoardLoading } =
    useBoardDetails(boardId);

  // Populate form if editing
  useEffect(() => {
    if (taskId && taskData) {
      setName(taskData.name || "");
      setDescription(taskData.description || "");
      setPriority(taskData.priority || "MEDIUM");
      setColumnId(taskData.column_id || columnIdParam);
    }
  }, [taskId, taskData, columnIdParam]);

  const validate = () => {
    const newErrors: Record<string, string | null> = {};
    if (!name) newErrors.title = "Task name is required";
    if (!columnId) newErrors.columnId = "Column is required";
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => !e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (taskId) {
        await updateTaskMutation.mutateAsync({
          taskId,
          data: {
            name,
            description,
            priority,
            column_id: columnId,
          },
        });
        showToast({ type: "success", title: "Task updated!" });
      } else {
        await createTaskMutation.mutateAsync({
          name,

          description,
          priority,
          column_id: columnId,
        });
        showToast({ type: "success", title: "Task created!" });
      }
      onClose();
    } catch (error: any) {
      let errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        (taskId ? "Failed to update task." : "Failed to create task.");
      const details = error?.response?.data?.error?.details;
      if (Array.isArray(details) && details.length > 0) {
        errorMessage = details
          .map((d: any) => d.message || JSON.stringify(d))
          .join("\n");
      }
      showToast({ type: "error", title: errorMessage });
    }
  };

  return (
    <Modal
      open={true}
      onOpenChange={onClose}
      className="md:max-w-2xl max-w-[90vw]"
      footer={
        <div className="flex gap-2 w-full justify-end items-center">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 rounded-full text-sm cursor-pointer hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            form="page-form"
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-full text-sm cursor-pointer hover:bg-green-700"
            disabled={
              taskId
                ? updateTaskMutation.isPending
                : createTaskMutation.isPending
            }
          >
            {taskId
              ? updateTaskMutation.isPending
                ? "Saving..."
                : "Save Changes"
              : createTaskMutation.isPending
                ? "Creating..."
                : "Create Task"}
          </button>
        </div>
      }
      header={
        <h2 className="text-xl text-black font-bold">
          {taskId ? "Edit Task" : "Create Task"}
        </h2>
      }
    >
      <form
        onSubmit={handleSubmit}
        id="page-form"
        className="flex flex-col gap-4 p-2"
      >
        {/* <div className="flex gap-2 mb-2">
          <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded">
            Board ID: {boardId}
          </span>
          <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded">
            Column ID: {columnId}
          </span>
        </div> */}
        {isTaskLoading && taskId ? (
          <div className="text-center text-gray-500">Loading task...</div>
        ) : isBoardLoading ? (
          <div className="text-center text-gray-500">Loading board...</div>
        ) : (
          <>
            <Input
              label="Task Name"
              type="text"
              name="title"
              placeholder="Task name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name || undefined}
            />
            <Input
              label="Description"
              type="textarea"
              name="description"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex flex-col gap-2">
              <label className="block font-semibold">Column</label>
              <select
                className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors text-sm"
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}
                name="column_id"
              >
                <option value="">Select column...</option>
                {(boardDetails?.columns ?? [])?.map((col) => (
                  <option key={col.column_id} value={col.column_id}>
                    {col.name}
                  </option>
                ))}
              </select>
              {errors.columnId && (
                <div className="text-red-500 text-sm">{errors.columnId}</div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="block font-semibold">Priority</label>
              <select
                className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors text-sm"
                value={priority}
                onChange={(e) =>
                  setPriority(
                    PRIORITY_ENUM[e.target.value as keyof typeof PRIORITY_ENUM],
                  )
                }
                name="priority"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
};

export default HandleTask;
