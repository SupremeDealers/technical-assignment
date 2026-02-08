
import React from 'react';
import { Task } from '../../api/tasks';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';

interface TaskCardProps {
  task: Task;
  forceHidden?: boolean;
  queryKey?: readonly unknown[];
  dndEnabled?: boolean;
}

const priorityColors = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800',
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  forceHidden,
  queryKey,
  dndEnabled = true,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `task-${task.id}`,
    disabled: !dndEnabled,
    data: {
      type: 'Task',
      taskId: task.id,
      columnId: task.columnId,
      task,
      queryKey,
      dndEnabled,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white p-3 rounded shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group ${
        isDragging || forceHidden ? 'opacity-0' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        <Link 
          to={`/tasks/${task.id}`} 
          className="relative z-10 cursor-pointer text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()} 
        >
          Details
        </Link>
      </div>
      <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
      {task.description && (
        <p className="text-sm text-gray-500 line-clamp-2">{task.description}</p>
      )}
    </div>
  );
};

export const TaskCardOverlay: React.FC<TaskCardProps> = ({ task }) => {
  return (
    <div className="bg-white p-3 rounded shadow-md border border-gray-200 pointer-events-none w-[320px]">
      <div className="flex justify-between items-start mb-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
      {task.description && (
        <p className="text-sm text-gray-500 line-clamp-2">{task.description}</p>
      )}
    </div>
  );
};