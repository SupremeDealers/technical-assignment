import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useTasksQuery } from '../hooks/useTask';
import { TaskCard } from './TaskCard';
import { Plus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { CreateTaskModal } from './CreateTaskModal';
import { cn } from '../utils/cn';

interface ColumnProps {
  column: any;
  boardId: string;
  search: string;
}

export const BoardColumn = ({ column, boardId, search }: ColumnProps) => {
  const [page, setPage] = useState(1);
  const LIMIT = 3; 
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { columnId: column.id }
  });

  const { data, isLoading, isPlaceholderData } = useTasksQuery({
    columnId: column.id,
    search,
    page,
    limit: LIMIT
  });

  const tasks = data?.data || [];
  const meta = data?.meta;

  return (
    <div 
      ref={setNodeRef} 
      className={cn(
        "flex flex-col bg-gray-50/80 rounded-xl border min-w-[320px] h-125 transition-colors shadow-sm",
        isOver ? "border-blue-400 bg-blue-50/30" : "border-gray-200"
      )}
    >
      
      {/*Column Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white/50 rounded-t-xl backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          <span className="font-bold text-gray-800 text-sm uppercase tracking-wider">{column.name}</span>
          <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {meta?.total || 0}
          </span>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition-all"
          title="Add Task"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Task List Area */}
      <div className="p-3 space-y-3 min-h-25 flex-1">
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin h-6 w-6 text-gray-300"/></div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            <span className="text-xs italic">No tasks found</span>
            {search && <span className="text-[10px]">Try clearing search</span>}
          </div>
        ) : (
          <div className={cn("space-y-3", isPlaceholderData && "opacity-50")}>
            {tasks.map((task: any) => (
              <TaskCard key={task.id} task={task} boardId={boardId} />
            ))}
          </div>
        )}
      </div>

      {/*pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="p-2 border-t border-gray-200 bg-white rounded-b-xl flex justify-between items-center">
          <button 
            disabled={page === 1 || isLoading}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="p-1.5 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
            {page} / {meta.totalPages}
          </span>
          <button 
            disabled={page === meta.totalPages || isLoading}
            onClick={() => setPage(p => p + 1)}
            className="p-1.5 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      )}

      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        columnId={column.id} 
      />
    </div>
  );
};