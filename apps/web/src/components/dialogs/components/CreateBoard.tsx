import React, { useState, useRef, useEffect } from "react";
import Modal from "../Modal";
import {
  useCreateBoard,
  useGetBoard,
  useUpdateBoard,
} from "../../../store/services/board.service";
import { useSearchParams } from "react-router-dom";
import { showToast } from "../../tools/toast";
import { Input } from "../../Input";
import { MdOutlineFilterList } from "react-icons/md";
import { GoTrash } from "react-icons/go";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
const COLUMN_TYPE = "COLUMN_ITEM";

function DraggableColumn({
  col,
  idx,
  moveColumn,
  handleColumnChange,
  handleRemoveColumn,
  error,
  columnsLength,
}: {
  col: { name: string };
  idx: number;
  moveColumn: (from: number, to: number) => void;
  handleColumnChange: (idx: number, value: string) => void;
  handleRemoveColumn: (idx: number) => void;
  error?: string;
  columnsLength: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [, drop] = useDrop({
    accept: COLUMN_TYPE,
    hover(item: { index: number }, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = idx;
      if (dragIndex === hoverIndex) return;
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      moveColumn(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: COLUMN_TYPE,
    item: { index: idx },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drag(drop(ref));
  return (
    <div
      ref={ref}
      className={`flex items-center justify-center gap-2 ${isDragging ? "opacity-50" : ""} mb-2`}
      style={{ cursor: "move" }}
    >
      <span className="cursor-move text-gray-500 w-10 h-10 min-w-10 flex items-center justify-center rounded bg-gray-100">
        <MdOutlineFilterList size={22} />
      </span>
      <div className="w-full">
        <Input
          type="text"
          name={`column_${idx}_name`}
          placeholder={`Column ${idx + 1} name`}
          value={col.name}
          onChange={(e) => handleColumnChange(idx, e.target.value)}
          error={error}
          label={""}
        />
      </div>
      <button
        type="button"
        className="text-red-500 bg-red-100 rounded-full p-1 flex items-center justify-center w-10 h-10 min-w-10"
        onClick={() => handleRemoveColumn(idx)}
        disabled={columnsLength === 1}
        title="Delete column"
      >
        <GoTrash size={20} />
      </button>
    </div>
  );
}

type Props = {
  onClose: () => void;
};

const CreateBoard = ({ onClose }: Props) => {
  const [searchParams] = useSearchParams();
  const refId = searchParams.get("ref");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [columns, setColumns] = useState<
    Array<{ name: string; column_id?: string }>
  >([{ name: "", column_id: "" }]);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const createBoardMutation = useCreateBoard();
  const updateBoardMutation = useUpdateBoard();
  const { data: boardData, isLoading: isBoardLoading } = useGetBoard(
    refId || "",
  );

  useEffect(() => {
    if (refId && boardData) {
      setName(boardData.name || "");
      setDescription(boardData.description || "");
      setColumns(
        Array.isArray(boardData.columns) && boardData.columns.length > 0
          ? boardData.columns.map((col: any) => ({
              name: col.name,
              column_id: col.column_id,
            }))
          : [{ name: "", column_id: undefined }],
      );
    }
  }, [refId, boardData]);

  const handleColumnChange = (idx: number, value: string) => {
    setColumns((cols) =>
      cols.map((col, i) => (i === idx ? { ...col, name: value } : col)),
    );
  };

  const moveColumn = (from: number, to: number) => {
    setColumns((cols) => {
      const updated = [...cols];
      const [removed] = updated.splice(from, 1);
      updated.splice(to, 0, removed);
      return updated;
    });
  };

  const handleAddColumn = () => {
    setColumns((cols) => [...cols, { name: "" }]);
  };

  const handleRemoveColumn = (idx: number) => {
    setColumns((cols) => cols.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const newErrors: Record<string, string | null> = {};
    if (!name) newErrors.name = "Board name is required";
    if (columns.length === 0)
      newErrors.columns = "At least one column is required";
    columns.forEach((col, idx) => {
      if (!col.name) newErrors[`column_${idx}`] = "Column name is required";
    });
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => !e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (refId) {
        await updateBoardMutation.mutateAsync({
          boardId: refId,
          data: {
            name,
            description,
            columns: columns.map((col, i) => ({ ...col, position: i })),
          },
        });
        showToast({ type: "success", title: "Board updated!" });
      } else {
        await createBoardMutation.mutateAsync({
          name,
          description,
          columns: columns.map((col, i) => ({ ...col, position: i })),
        });
        showToast({ type: "success", title: "Board created!" });
      }
      onClose();
    } catch (error: any) {
      let errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        (refId ? "Failed to update board." : "Failed to create board.");
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
    <DndProvider backend={HTML5Backend}>
      <Modal
        open={true}
        onOpenChange={onClose}
        className="md:max-w-2xl max-w-[90vw]"
        footer={
          <div className="flex gap-2 justify-end w-full items-center">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 rounded-full text-sm hover:bg-gray-400"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              form="page-form"
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-full text-sm hover:bg-green-700"
              disabled={
                refId
                  ? updateBoardMutation.isPending
                  : createBoardMutation.isPending
              }
            >
              {refId
                ? updateBoardMutation.isPending
                  ? "Saving..."
                  : "Save Changes"
                : createBoardMutation.isPending
                  ? "Creating..."
                  : "Create Board"}
            </button>
          </div>
        }
      >
        <form
          onSubmit={handleSubmit}
          id="page-form"
          className="flex flex-col gap-4 p-4"
        >
          <h2 className="text-xl font-bold mb-2">
            {refId ? "Edit Board" : "Create Board"}
          </h2>
          {isBoardLoading && refId ? (
            <div className="text-center text-gray-500">Loading board...</div>
          ) : (
            <>
              <Input
                label="Board Name"
                type="text"
                name="name"
                placeholder="Board name"
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
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center gap-4">
                  <label className="block font-semibold">Columns</label>
                  <button
                    type="button"
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700"
                    onClick={handleAddColumn}
                  >
                    + Add Column
                  </button>
                </div>
                {columns.map((col, idx) => (
                  <DraggableColumn
                    key={idx}
                    col={col}
                    idx={idx}
                    moveColumn={moveColumn}
                    handleColumnChange={handleColumnChange}
                    handleRemoveColumn={handleRemoveColumn}
                    error={errors[`column_${idx}`] || undefined}
                    columnsLength={columns.length}
                  />
                ))}
                {errors.columns && (
                  <div className="text-red-500 text-sm">{errors.columns}</div>
                )}
              </div>
            </>
          )}
        </form>
      </Modal>
    </DndProvider>
  );
};

export default CreateBoard;
