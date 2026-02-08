import { Meta } from "../types/types";

interface PaginationProps {
  meta: Meta;
  setPage: (val: number) => void;
}

export default function Pagination({ meta, setPage }: PaginationProps) {
  return (
    <div className="mt-6 flex items-center justify-between">
      <p className="text-sm text-gray-600">Page {meta.page}</p>

      <div className="flex gap-2">
        <button
          className="px-3 py-2 rounded border disabled:opacity-50 hover:bg-black hover:text-white"
          onClick={() => setPage(Math.max(1, meta.page - 1))}
          disabled={meta.page === 1}
        >
          Prev
        </button>

        <button
          className="px-3 py-2 rounded border disabled:opacity-50 hover:bg-black hover:text-white"
          onClick={() => setPage(meta.page + 1)}
          disabled={!meta.hasNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}
