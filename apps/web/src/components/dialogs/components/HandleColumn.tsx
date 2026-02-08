import React, { useState, useEffect } from "react";
import Modal from "../Modal";
import {
  useDeleteColumn,
  useGetColumn,
  useUpdateColumn,
} from "../../../store/services/board.service";
import { useSearchParams } from "react-router-dom";
import { showToast } from "../../tools/toast";
import { Input } from "../../Input";

type Props = {
  onClose: () => void;
};

const HandleColumn = ({ onClose }: Props) => {
  const [searchParams] = useSearchParams();
  const columnId = searchParams.get("ref");
  const updateColumnMutation = useUpdateColumn();
  const deleteColumnMutation = useDeleteColumn();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { data: columnData, isLoading: isColumnLoading } = useGetColumn(
    columnId || "",
  );

  useEffect(() => {
    if (columnId && columnData) {
      setName(columnData.name || "");
    }
  }, [columnId, columnData]);

  const validate = () => {
    if (!name) {
      setError("Column name is required");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await updateColumnMutation.mutateAsync({
        column_id: columnId || "",
        data: { name },
      });
      showToast({ type: "success", title: "Column updated!" });
      onClose();
    } catch (error: any) {
      let errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update column.";
      showToast({ type: "error", title: errorMessage });
    }
  };

  // Delete column mutation
  const handleDelete = async () => {
    try {
      await deleteColumnMutation.mutateAsync({ column_id: columnId || "" });
      showToast({ type: "success", title: "Column deleted!" });
      onClose();
    } catch (error: any) {
      let errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete column.";
      showToast({ type: "error", title: errorMessage });
    }
  };

  return (
    <Modal
      open={true}
      onOpenChange={onClose}
      className="md:max-w-md max-w-[90vw]"
      footer={
        <div className="flex gap-1 w-full justify-between items-center">
          <button
            type="button"
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 text-xs w-full"
            onClick={handleDelete}
          >
            Delete Column
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 rounded-full  hover:bg-gray-400 text-xs w-full"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            form="page-form"
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-full  hover:bg-green-700 text-xs w-full"
          >
            Update Column
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
          {isColumnLoading ? "Loading column..." : "Edit Column"}
        </h2>
        {isColumnLoading ? (
          <div className="text-center text-gray-500">Loading column...</div>
        ) : (
          <>
            <Input
              label="Column Name"
              type="text"
              name="name"
              placeholder="Column name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={error || undefined}
            />
          </>
        )}
      </form>
    </Modal>
  );
};

export default HandleColumn;
