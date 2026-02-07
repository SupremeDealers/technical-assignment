import { useState, useEffect } from 'react';
import { useAllBoards, useBoardColumns } from '../hooks/useBoard';
import { useUpdateTask } from '../hooks/useTask';
import { useDebounce } from '../hooks/useDebounce';
import { BoardColumn } from '../components/BoardColumn';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { Search, Layout, ChevronDown, Loader2 } from 'lucide-react';

export default function BoardDashboard() {
  const { data: boards } = useAllBoards();
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);

  // Auto-select first board on load
  useEffect(() => {
    if (boards && boards.length > 0 && !activeBoardId) {
      setActiveBoardId(boards[0].id);
    }
  }, [boards]);

  const { data: columns, isLoading: loadingCols } = useBoardColumns(activeBoardId);

  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 500);

  const updateTask = useUpdateTask();

  // Sensors: Improve drag experience (require 10px movement to start drag so clicks still work)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const fromColumnId = active.data.current?.fromColumnId;
    const toColumnId = over.data.current?.columnId;

    if (toColumnId && fromColumnId !== toColumnId) {// Only API call if column changed
      updateTask.mutate({ id: taskId, columnId: toColumnId });
    }
  };

  if (!boards || boards.length === 0) {
     return <div className="p-20 text-center text-gray-500">No boards available. Please ask an Admin to create one.</div>;
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="h-full flex flex-col space-y-6">
        
        {/*top*/}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          
          {/* Board Selector */}
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <Layout className="h-5 w-5" />
            </div>
            <div className="relative">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider absolute -top-2 left-0">
                Active Board
              </label>
              <div className="flex items-center gap-2">
                <select 
                  value={activeBoardId || ''}
                  onChange={(e) => setActiveBoardId(e.target.value)}
                  className="appearance-none font-bold text-gray-800 text-lg bg-transparent outline-none cursor-pointer pr-6 hover:text-blue-600 transition-colors"
                >
                  {boards?.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <ChevronDown className="h-4 w-4 text-gray-400 absolute right-0 bottom-1.5 pointer-events-none"/>
              </div>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Filter tasks..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/*board area */}
        <div className="flex-1 overflow-x-auto custom-scrollbar">
          <div className="flex gap-6 min-w-full pb-4 items-start">
            {loadingCols ? (
              <div className="w-full flex justify-center py-20">
                <div className="flex flex-col items-center gap-3 text-gray-400">
                  <Loader2 className="animate-spin h-8 w-8 text-blue-500"/>
                  <span className="text-sm font-medium">Loading Columns...</span>
                </div>
              </div>
            ) : columns?.length === 0 ? (
               <div className="w-full text-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                 This board has no columns yet.
               </div>
            ) : (
              columns?.map((col: any) => (
                <BoardColumn 
                  key={col.id} 
                  column={col} 
                  boardId={activeBoardId!} 
                  search={debouncedSearch} 
                />
              ))
            )}
          </div>
        </div>

      </div>
    </DndContext>
  );
}