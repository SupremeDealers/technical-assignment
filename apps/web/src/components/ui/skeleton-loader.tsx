import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return <div className={cn('skeleton-pulse', className)} />;
};

export const BoardCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-lg border bg-card p-5 card-shadow">
      <Skeleton className="h-6 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
};

export const TaskCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-lg border bg-card p-3">
      <Skeleton className="h-5 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
};

export const ColumnSkeleton: React.FC = () => {
  return (
    <div className="w-72 flex-shrink-0 kanban-column">
      <Skeleton className="h-6 w-1/2 mb-4" />
      <div className="space-y-3">
        <TaskCardSkeleton />
        <TaskCardSkeleton />
        <TaskCardSkeleton />
      </div>
    </div>
  );
};
