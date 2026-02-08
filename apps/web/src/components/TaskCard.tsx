import { useState } from "react";
import { motion } from "framer-motion";
import { FaChevronDown } from "react-icons/fa6";
import { HiOutlineTrash } from "react-icons/hi2";
import { LuSettings2 } from "react-icons/lu";
import { IoCalendarClearOutline } from "react-icons/io5";
import { MODAL_COMPONENTS } from "../store/state/modal.store";
import { useModal } from "../hooks/useModal";
import { Task } from "../types";
import CommentCard from "./CommentCard";
import { useState as useReactState } from "react";
import { showToast } from "./tools/toast";
import Modal from "./dialogs/Modal";
import { useDeleteTask } from "../store/services/board.service";
import { useCreateComment } from "../store/services/board.service";
import { Input } from "./Input";

interface TaskCardProps {
  task: Task;
  index: number;
  boardId: string;
  onDragStart: (e: React.DragEvent, task: Task, columnId: string) => void;
  handleDragOverItem: (
    e: React.DragEvent,
    task_id: string,
    index: number,
  ) => void;
}

export const TaskCard = ({
  task,
  boardId,
  onDragStart,
  handleDragOverItem,
  index,
}: TaskCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showCommentInput, setShowCommentInput] = useReactState(false);
  const [commentText, setCommentText] = useReactState("");
  const [commentLoading, setCommentLoading] = useReactState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const deleteTaskMutation = useDeleteTask();
  const createCommentMutation = useCreateComment();

  const addComment = async () => {
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      await createCommentMutation.mutateAsync({
        taskId: task.task_id,
        data: { content: commentText },
      });
      setCommentText("");
      setShowCommentInput(false);
      if (!expanded) {
        setExpanded(true);
      }
    } catch (error: any) {
      let errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add comment.";
      showToast({ type: "error", title: errorMessage });
    } finally {
      setCommentLoading(false);
    }
  };

  const handleOpenDeleteModal = () => setDeleteModalOpen(true);
  const handleCloseDeleteModal = () => setDeleteModalOpen(false);

  const handleDelete = async () => {
    if (!task.task_id) return;
    try {
      await deleteTaskMutation.mutateAsync(task.task_id);
      showToast({ type: "success", title: "Task deleted!" });
      handleCloseDeleteModal();
    } catch (error: any) {
      let errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete task.";
      showToast({ type: "error", title: errorMessage });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-300";
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "low":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const { openModal } = useModal();

  return (
    <motion.div
      className="rounded-lg p-0.5 bg-gradient-to-br from-gray-200 to-gray-200 shadow-sm transition-all duration-200 hover:shadow-md"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onDragOver={(e) => handleDragOverItem(e as any, task.column_id, index)}
    >
      <div
        className="rounded-lg w-full border border-gray-200 bg-white p-3 shadow-sm flex flex-col gap-2 cursor-move hover:border-primary-300 transition-colors"
        draggable
        onDragStart={(e) => onDragStart(e, task, task.column_id)}
      >
        {/* Header: Title and Priority */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-gray-800 flex-1 cursor-pointer hover:text-primary-600 transition-colors">
            {task.name}
          </h4>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getPriorityColor(task.priority)}`}
          >
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        </div>

        {/* Description (Always visible) */}
        {task.description && (
          <div className="w-full">
            <p className="text-xs text-gray-600 mb-1">{task.description}</p>
          </div>
        )}

        {/* Comments (Collapsible) */}
        <div className="w-full">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center text-xs text-primary-600 hover:text-primary-700 transition-colors gap-1"
            >
              <span>Comments</span>
              <div className="p-1 w-6 h-6  flex justify-center items-center rounded-full cursor-pointer bg-gray-200 border border-gray-300 text-gray-700 hover:bg-gray-300">
                <FaChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                />
              </div>
            </button>
            <button
              onClick={() => {
                setExpanded(true);
                setShowCommentInput((v) => !v);
              }}
              className={`px-3 py-1 rounded-full cursor-pointer border transition-colors ${showCommentInput ? "bg-rose-600 text-white hover:bg-rose-500 border-rose-800" : "bg-blue-600 text-white hover:bg-blue-500 border-blue-800"} text-[11px]`}
            >
              {showCommentInput ? "Cancel" : "Add Comment"}
            </button>
          </div>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              expanded ? " opacity-100 mt-2" : "max-h-0 opacity-0"
            } flex flex-col gap-2`}
          >
            <CommentCard taskId={task.task_id} />
            {showCommentInput && (
              <div className=" flex flex-col gap-1 ">
                <Input
                  type="textarea"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  label={""}
                  name={""} // disabled={commentLoading}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowCommentInput(false)}
                    className="px-3 py-1 rounded-full cursor-pointer bg-gray-200 border border-gray-300 text-gray-700 hover:bg-gray-300 text-xs font-semibold"
                    disabled={commentLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addComment}
                    className="px-3 py-1 rounded-full cursor-pointer bg-blue-600 text-white border border-blue-800 hover:bg-blue-500 text-xs font-semibold disabled:opacity-60"
                    disabled={commentLoading || !commentText.trim()}
                  >
                    {commentLoading ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer: Date and Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center justify-start gap-1 text-[11px] text-gray-500">
            <IoCalendarClearOutline fontSize={16} />
            <span>{formatDate(task.created_at)}</span>
          </div>

          <div className="flex justify-end items-center gap-2">
            <button
              onClick={() =>
                openModal({
                  modal_name: MODAL_COMPONENTS.HANDLE_TASK,
                  ref: {
                    column_id: task.column_id,
                    board_id: boardId,
                    task_id: task.task_id,
                  },
                })
              }
              className="p-2 cursor-pointer duration-300 hover:bg-blue-100 hover:text-blue-500 rounded-full transition-colors text-gray-500"
              title="Edit board"
            >
              <LuSettings2 size={20} />
            </button>
            <button
              onClick={handleOpenDeleteModal}
              className="p-2 cursor-pointer duration-300 rounded-full transition-colors text-gray-500 hover:bg-red-100 hover:text-red-500"
              title="Delete task"
            >
              <HiOutlineTrash size={20} />
            </button>
            {/* Delete Confirmation Modal */}
            <Modal
              open={deleteModalOpen}
              onOpenChange={handleCloseDeleteModal}
              className="md:max-w-120"
            >
              <div className="px-4">
                <h3 className="text-lg font-semibold py-2 text-center">
                  Delete Task?
                </h3>
                <p className="text-gray-600 mb-4 text-center">
                  Are you sure you want to delete this task? This action cannot
                  be undone.
                </p>
              </div>
              <div className="flex gap-2 w-full items-center justify-center">
                <button
                  onClick={handleCloseDeleteModal}
                  className="px-4 py-2 rounded w-full bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded w-full bg-red-600 text-white hover:bg-red-700 font-semibold disabled:opacity-60"
                  disabled={deleteTaskMutation.isPending}
                >
                  {deleteTaskMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </Modal>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
