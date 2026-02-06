
import React from 'react';
import { Column as IColumn } from '../../api/tasks';
import { TaskCard } from './TaskCard';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTasks, useCreateTask } from '../../hooks/useTasks';
import { Plus } from 'lucide-react';

interface ColumnProps {
  column: IColumn;
}

export const Column: React.FC<ColumnProps> = ({ column }) => {
  const { data: tasks = [] } = useTasks(column.id);
  const { setNodeRef } = useDroppable({ id: column.id, data: { type: 'Column', column } });
  const createTask = useCreateTask();

  const handleAddQuick = () => {
    const title = prompt('Task title:');
    if (title) {
      createTask.mutate({ columnId: column.id, data: { title, priority: 'MEDIUM' } });
    }
  };

  return (
    <div className="flex flex-col w-80 shrink-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-semibold text-gray-700">{column.title}</h3>
        <span className="text-gray-400 text-sm bg-gray-100 px-2 py-0.5 rounded-full">{tasks.length}</span>
      </div>
      
      <div 
        ref={setNodeRef} 
        className="bg-gray-50 flex-1 rounded-lg p-2 min-h-[500px] flex flex-col gap-2"
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        <button 
          onClick={handleAddQuick}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-2 rounded transition-colors text-sm"
        >
          <Plus size={16} /> Add Task
        </button>
      </div>
    </div>
  );
};