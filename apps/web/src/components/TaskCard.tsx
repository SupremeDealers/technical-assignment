import { useDraggable } from '@dnd-kit/core';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import { GripVertical } from 'lucide-react';

interface TaskProps {
  task: any;
  boardId: string;
}

export const TaskCard = ({ task, boardId }: TaskProps) => {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task, fromColumnId: task.columnId }, //pass data for drag event
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const priorityStyles: Record<string, string> = {
    high: 'bg-red-50 text-red-700 border-red-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    low: 'bg-green-50 text-green-700 border-green-200',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners} 
      {...attributes}
      className={cn(
        "bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group relative cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 z-50 rotate-2 shadow-xl ring-2 ring-blue-500 ring-offset-2"
      )}
    >
      <div className="flex justify-between items-center mb-2.5">
        <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border", priorityStyles[task.priority])}>
          {task.priority}
        </span>
        <span className="text-[10px] text-gray-400 font-medium">
          {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>
      </div>

      <h4 className="font-semibold text-gray-800 text-sm leading-snug mb-3">
        {task.title}
      </h4>

      {/* Footer View Details Button */}
      <button 
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/${boardId}/${task.columnId}/task/${task.id}`, { state: { task } });
        }}
        className="w-full text-xs py-1.5 text-center bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-md font-medium border border-gray-100 transition-colors"
      >
        View Details
      </button>

      {/*drag Handle Visual */}
      <div className="absolute top-3 right-2 opacity-0 group-hover:opacity-100 text-gray-300">
        <GripVertical className="h-4 w-4" />
      </div>
    </div>
  );
};