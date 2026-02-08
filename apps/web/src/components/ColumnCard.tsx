import { useEffect, useState } from "react";
import Select from "./Select";

import { MODAL_COMPONENTS } from "../store/state/modal.store";
import { motion } from "framer-motion";
import { LuSettings2 } from "react-icons/lu";
import { TaskCard } from "./TaskCard";
import {
  BsChevronDoubleLeft,
  BsChevronDoubleRight,
  BsChevronLeft,
  BsChevronRight,
} from "react-icons/bs";
import { FaPlus } from "react-icons/fa6";
import { Column, PRIORITY_ENUM, Task } from "../types";
import { useModal } from "../hooks/useModal";
import { useTasks } from "../store/services/board.service";
import { Input } from "./Input";

type ColumnCardProps = {
  column: Column;
  columnIndex: number;
  is_dark?: boolean;
  handleDrop: (e: React.DragEvent, targetColumnId: string) => void;
  handleDragOverDropZone: (
    e: React.DragEvent,
    targetColumnId: string,
    targetIndex: number,
  ) => void;
  setHoveredColumnId: React.Dispatch<React.SetStateAction<string | null>>;
  hoveredColumnId: string | null;
  hoveredIndex: number | null;
  handleDragStart: (e: React.DragEvent, task: Task, columnId: string) => void;
  handleDragOver: (e: React.DragEvent) => void;
};

const ColumnCard = ({
  column,
  columnIndex,
  handleDrop,
  handleDragOverDropZone,
  handleDragStart,
  hoveredColumnId,
  hoveredIndex,
  handleDragOver,
}: ColumnCardProps) => {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [priority, setPriority] = useState<PRIORITY_ENUM | "">("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useTasks({
    column_id: column.column_id,
    page,
    limit: pageSize,
    search,
    priority: priority === "" ? undefined : priority,
  });

  const tasks = data?.tasks || [];
  const [lastPage, setLastPage] = useState(data?.pagination?.total || 0);
  const [prevPage, setPrevPage] = useState(page > 1 ? page - 1 : null);
  const [nextPage, setNextPage] = useState(
    page < (data?.pagination?.total ?? 1) ? page + 1 : null,
  );

  useEffect(() => {
    if (data?.pagination) {
      setLastPage(data.pagination.total_pages);
      setPrevPage(data.pagination.prev_page);
      setNextPage(data.pagination.next_page);
      setPage(data.pagination.current_page);
    }
  }, [data?.pagination]);

  const { openModal } = useModal();

  return (
    <motion.div
      key={column.column_id}
      className="flex flex-col bg-white border border-gray-200 h-full rounded-lg min-h-[600px]"
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, column.column_id)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: columnIndex * 0.1,
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
    >
      {/* Column Header */}
      <div className="flex flex-col items-center justify-between  px-3 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between  px-3 py-2 w-full ">
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                openModal({
                  modal_name: MODAL_COMPONENTS.HANDLE_COLUMN,
                  ref: column.column_id,
                })
              }
              className="p-1.5 cursor-pointer duration-300 border border-gray-300 bg-gray-200 hover:bg-blue-100 hover:text-blue-500 rounded-full transition-colors text-gray-500"
              title="Edit board"
            >
              <LuSettings2 size={18} />
            </button>
            <h3 className="font-semibold text-gray-700">{column.name}</h3>
            <span className="text-sm text-gray-500">
              ({column._count.tasks})
            </span>
          </div>
          <button
            className="flex items-center justify-center w-8 h-8 text-gray-700 transition-colors border border-gray-300 bg-gray-200 rounded-full hover:bg-gray-300"
            onClick={() =>
              openModal({
                modal_name: MODAL_COMPONENTS.HANDLE_TASK,
                ref: {
                  column_id: column.column_id,
                  board_id: column.board_id,
                },
              })
            }
            title="Add task"
          >
            <FaPlus size={18} />
          </button>
        </div>
        <div className="w-full flex items-center justify-between gap-2">
          <div className="w-full">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              label={""}
              name={""}
            />
          </div>
          <div className="min-w-24">
            <Select
              value={[priority]}
              options={[
                { id: "", name: "All" },
                { id: PRIORITY_ENUM.LOW, name: "Low" },
                { id: PRIORITY_ENUM.MEDIUM, name: "Medium" },
                { id: PRIORITY_ENUM.HIGH, name: "High" },
              ]}
              onChange={(e) =>
                setPriority(
                  PRIORITY_ENUM[String(e[0]) as keyof typeof PRIORITY_ENUM],
                )
              }
              placeholder={""} // className="w-full"
              className={`w-full border rounded-lg px-3 py-2 placeholder-slate-400 transition-all disabled:opacity-50`}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 gap-1 p-2 overflow-y-auto">
        {tasks.length === 0 ? (
          search && search.trim() !== "" ? (
            <div className="text-center text-gray-400 py-4">
              No tasks match your search.
            </div>
          ) : (
            <div className="text-center text-gray-400 py-4">
              No tasks in this column.
            </div>
          )
        ) : (
          tasks.map((task, index) => (
            <div key={task.task_id}>
              <div
                className={`transition-all duration-200 mb-2 ${
                  hoveredIndex === index && hoveredColumnId === column.column_id
                    ? "h-6 p-2 bg-gray-100 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center"
                    : "h-0 border-gray-200"
                }`}
                onDragOver={(e) =>
                  handleDragOverDropZone(e, column.column_id, index)
                }
              >
                {hoveredIndex === index &&
                  hoveredColumnId === column.column_id && (
                    <span className="text-xs font-bold text-gray-600">
                      Drop here
                    </span>
                  )}
              </div>

              <TaskCard
                task={task}
                boardId={column.board_id}
                index={index}
                onDragStart={handleDragStart}
                handleDragOverItem={handleDragOverDropZone}
              />
            </div>
          ))
        )}

        <div
          className={`transition-all duration-200 ${
            hoveredIndex === (column.tasks ?? []).length &&
            hoveredColumnId === column.column_id
              ? "h-12 bg-primary-200 rounded-lg border-2 border-dashed border-primary-400 flex items-center justify-center"
              : "h-0"
          }`}
          onDragOver={(e) =>
            handleDragOverDropZone(
              e,
              column.column_id,
              (column.tasks ?? []).length,
            )
          }
        >
          {hoveredIndex === (column.tasks ?? []).length &&
            hoveredColumnId === column.column_id && (
              <span className="text-xs font-bold text-primary-600">
                Drop here
              </span>
            )}
        </div>
      </div>
      <div className="flex flex-row items-center justify-between p-2 py-1 border-t border-gray-200">
        <div className="flex items-center justify-start gap-2">
          <div className="min-w-24">
            <Select
              value={[String(pageSize)]}
              options={[
                { id: "5", name: "5" },
                { id: "10", name: "10" },
                { id: "15", name: "15" },
                { id: "20", name: "20" },
              ]}
              onChange={(e) => setPageSize(Number(e[0]))}
              placeholder={""}
              className={`w-full border rounded-lg px-3 py-2 placeholder-slate-400 transition-all disabled:opacity-50`}
            />
          </div>
        </div>

        <div className="flex flex-row items-center gap-4">
          <div className="flex flex-row items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(1)}
              disabled={!prevPage || prevPage < 1}
              className={`p-1 h-7 w-7 cursor-pointer hover:bg-gray-300 border transition-all duration-300 flex justify-center items-center rounded bg-white border-gray-200
                    } ${
                      !prevPage || prevPage < 1
                        ? `opacity-50 pointer-events-none text-gray-500`
                        : `bg-gray-200 text-gray-700`
                    }`}
            >
              <BsChevronDoubleLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setPage(page - 1)}
              disabled={!prevPage || prevPage < 1}
              className={`p-1 h-7 w-7 cursor-pointer hover:bg-gray-300 border transition-all duration-300 flex justify-center items-center rounded bg-white border-gray-200
                    }   ${
                      !prevPage || prevPage < 1
                        ? `opacity-50 pointer-events-none text-gray-500`
                        : `bg-gray-200 text-gray-700`
                    }`}
            >
              <BsChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => {
                console.log("Next page clicked. Current page:", page);
                setPage(page + 1);
              }}
              disabled={!nextPage || nextPage < 1}
              className={`p-1 h-7 w-7 cursor-pointer hover:bg-gray-300 border transition-all duration-300 flex justify-center items-center rounded bg-white border-gray-200
                    } ${
                      !nextPage || !nextPage || nextPage < 1
                        ? `opacity-50 pointer-events-none text-gray-500`
                        : `bg-gray-200 text-gray-700`
                    }`}
            >
              <BsChevronRight size={18} />
            </button>
            <button
              type="button"
              onClick={() => setPage(lastPage)}
              disabled={page === lastPage || !lastPage || lastPage <= 1}
              className={`p-1 h-7 w-7 cursor-pointer hover:bg-gray-300 border transition-all duration-300 flex justify-center items-center rounded bg-white border-gray-200 ${
                page === lastPage || !lastPage || lastPage <= 1
                  ? `opacity-50 pointer-events-none text-gray-500`
                  : `bg-gray-200 text-gray-700`
              }`}
            >
              <BsChevronDoubleRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ColumnCard;
