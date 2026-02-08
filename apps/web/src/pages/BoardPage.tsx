import { useParams } from "react-router-dom";
import { KanbanBoard } from "../components/KanbanBoard";
import { useGetBoard, useMoveTask } from "../store/services/board.service";
import Header from "../components/Header";

export const BoardPage = () => {
  const { board_id } = useParams();
  const { data, isLoading, isError } = useGetBoard(board_id || "");

  const moveTaskMutation = useMoveTask();
  const handleTaskMove = ({
    task_id,
    to_column_id,
    new_order,
  }: {
    task_id: string;
    to_column_id: string;
    new_order: number;
  }) => {
    moveTaskMutation.mutate({
      task_id: task_id,
      to_column_id,
      new_order,
    });
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex-1 overflow-auto p-2 bg-gray-50">
        {isLoading ? (
          <div>Loading board...</div>
        ) : isError ? (
          <div>Failed to load board.</div>
        ) : (
          <KanbanBoard
            columns={data?.columns || []}
            onTaskMove={handleTaskMove}
          />
        )}
      </main>
    </div>
  );
};
