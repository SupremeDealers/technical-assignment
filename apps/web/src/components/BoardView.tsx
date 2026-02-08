import { useEffect, useState } from "react";
import { getColumns } from "../api/board.api";
import Column from "./Column";

export default function BoardView({ boardId }: { boardId: number }) {
  const [columns, setColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  function refreshBoard() {
    setRefreshKey((k) => k + 1);
  }

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    getColumns(boardId)
      .then((c) => {
        if (mounted) setColumns(c);
      })
      .finally(() => setLoading(false));

    return () => {
      mounted = false;
    };
  }, [boardId, refreshKey]);

  if (loading)
    return (
      <div className="w-full h-dvh flex items-center justify-center">
        <h1 className="text-2xl">Loading...</h1>
      </div>
    );

  return (
    <div className="w-full py-8 px-3">
      <div className="lg:mx-auto lg:w-5/6 flex flex-col">
        <section className="w-full flex items-center justify-between  mb-4">
          <h2 className="font-semibold text-2xl">Board</h2>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="py-2 px-5 text-gray-50 bg-blue-600 rounded-md font-semibold self-center"
          >
            Logout
          </button>
        </section>
        <div className="grid lg:grid-cols-3 gap-7">
          {columns.map((col) => (
            <Column
              key={col.id}
              column={col}
              columns={columns}
              refreshBoard={refreshBoard}
              refreshKey={refreshKey}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
