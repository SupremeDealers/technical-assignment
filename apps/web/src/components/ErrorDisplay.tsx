import { QueryClient } from "@tanstack/react-query";

type ErrorProps = {
  msg: string;
  qc: QueryClient;
  boardId: string;
};

export default function ErrorDisplay({ msg, qc, boardId }: ErrorProps) {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Could not load tasks</h2>
        <p className="text-sm text-gray-600 mt-1">{msg}</p>
        <button
          className="mt-4 px-3 py-2 rounded bg-black text-white"
          onClick={() => qc.invalidateQueries({ queryKey: ["tasks", boardId] })}
        >
          Retry
        </button>
      </div>
    </div>
  );
}
