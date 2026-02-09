import { useBoards, useDeleteBoard } from "../store/services/board.service";
import { APP_ROUTES } from "../data/route";
import { MODAL_COMPONENTS } from "../store/state/modal.store";
import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { LuSettings2 } from "react-icons/lu";
import { HiOutlineTrash } from "react-icons/hi2";
import Modal from "../components/dialogs/Modal";
import { useModal } from "../hooks/useModal";
import { showToast } from "../components/tools/toast";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

export const DashboardPage = () => {
  const { data: boards, isLoading, isError } = useBoards();
  const { openModal } = useModal();
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    boardId: null as string | null,
  });
  const deleteBoardMutation = useDeleteBoard();
  const navigate = useNavigate();

  const handleDeleteSuccess = () => {
    showToast({
      type: "success",
      title: "Board deleted successfully",
    });
  };
  const handleDeleteError = (error: any) => {
    showToast({
      type: "error",
      title:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete board.",
    });
  };

  const handleBoardClick = (board: any) => {
    navigate(APP_ROUTES.BOARD_PAGE.replace(":board_id", board.board_id));
  };

  const handleAddBoard = () => {
    openModal({ modal_name: MODAL_COMPONENTS.CREATE_BOARD });
  };

  const handleOpenDeleteModal = (boardId: string) => {
    setDeleteModal({ open: true, boardId });
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({ open: false, boardId: null });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.boardId) {
      deleteBoardMutation.mutate(deleteModal.boardId, {
        onSuccess: () => {
          handleDeleteSuccess();
          handleCloseDeleteModal();
        },
        onError: (error) => {
          handleDeleteError(error);
          handleCloseDeleteModal();
        },
      });
    } else {
      handleCloseDeleteModal();
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex flex-col gap-2 overflow-auto p-4 h-full bg-gray-50">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Your Boards</h2>
          <button
            onClick={handleAddBoard}
            className="px-3 py-2 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 text-sm transition-colors cursor-pointer flex justify-center items-center gap-1"
          >
            <FiPlus fontSize={20} /> Add Board
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading && <div>Loading boards...</div>}
          {isError && <div>Failed to load boards.</div>}
          {boards && boards.length === 0 && <div>No boards found.</div>}
          {boards &&
            boards.map((board) => (
              <div
                key={board.board_id}
                className="bg-white rounded-lg shadow p-4 flex flex-col justify-between hover:shadow-md transition-shadow border border-gray-200"
                style={{ minHeight: 180 }}
              >
                <div>
                  <h3 className="text-xl font-semibold mb-2">{board.name}</h3>
                  <p className="text-gray-600 mb-4">{board.description}</p>
                  <div className="text-xs text-gray-400">
                    Created: {new Date(board.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center justify-between w-full gap-4 border-t border-dashed pt-2 border-gray-300">
                    <div className="flex items-center justify-start w-full">
                      <div
                        className="flex items-center gap-1 px-3 cursor-pointer py-2 rounded-full backdrop-blur-sm transition-all duration-300 border border-[#e6e6e6] text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleBoardClick(board)}
                      >
                        <span className="text-xs font-medium">
                          View details
                        </span>
                        {/* You can replace this with your ChevronRight icon if available */}
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-transform duration-300 group-hover:translate-x-1"
                          viewBox="0 0 24 24"
                        >
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => {
                          // Still use global modal for update
                          openModal({
                            modal_name: MODAL_COMPONENTS.CREATE_BOARD,
                            ref: board.board_id,
                          });
                        }}
                        className="p-2 cursor-pointer duration-300 hover:bg-blue-100 hover:text-blue-500 rounded-full transition-colors text-gray-500 hover:bg-blue-100 hover:text-blue-500"
                        title="Edit board"
                      >
                        <LuSettings2 size={22} />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(board.board_id)}
                        className="p-2 cursor-pointer duration-300 rounded-full transition-colors text-gray-500 hover:bg-red-100 hover:text-red-500"
                        title="Delete board"
                      >
                        <HiOutlineTrash size={22} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          <Modal
            open={deleteModal.open}
            onOpenChange={handleCloseDeleteModal}
            className="md:max-w-120"
          >
            <div className="px-4">
              <h3 className="text-lg font-semibold py-2 text-center">
                Delete Board?
              </h3>
              <p className="text-gray-600 mb-4 text-center">
                Are you sure you want to delete this board? This action cannot
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
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded w-full bg-red-600 text-white hover:bg-red-700 font-semibold disabled:opacity-60"
                disabled={deleteBoardMutation.isPending}
              >
                {deleteBoardMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </Modal>
        </div>
      </main>
    </div>
  );
};
