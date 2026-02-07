interface EmptyProps {
  debouncedVal: string;
  setOpenCreate: (val: boolean) => void;
  setSearch: (val: string) => void;
}

export default function EmptySearch({
  debouncedVal,
  setOpenCreate,
  setSearch,
}: EmptyProps) {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">
          {debouncedVal ? "No matching tasks" : "No tasks yet"}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {debouncedVal
            ? "Try a different search term."
            : "Create your first task to get started."}
        </p>

        <div className="mt-4 flex gap-2">
          {!debouncedVal ? (
            <button
              className="px-3 py-2 rounded bg-black text-white"
              onClick={() => setOpenCreate(true)}
            >
              Create a task
            </button>
          ) : (
            <button
              className="px-3 py-2 rounded border"
              onClick={() => setSearch("")}
            >
              Clear search
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
