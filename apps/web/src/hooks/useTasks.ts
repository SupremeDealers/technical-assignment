import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as tasksApi from '../api/tasks';

export const useBoard = () => {
  return useQuery({
    queryKey: ['board'],
    queryFn: tasksApi.getMyBoard,
  });
};

export const useTasks = (columnId: number) => {
  return useQuery({
    queryKey: ['tasks', columnId],
    queryFn: () => tasksApi.getTasks(columnId),
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ columnId, data }: { columnId: number; data: any }) => 
      tasksApi.createTask(columnId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.columnId] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: any }) => tasksApi.updateTask(taskId, data),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      const previous = queryClient.getQueriesData({ queryKey: ['tasks'] });

      const nextColumnId = variables?.data?.columnId;
      if (typeof nextColumnId !== 'number' || Number.isNaN(nextColumnId)) {
        return { previous };
      }

      let fromColumnId: number | null = null;
      let taskToMove: any | null = null;

      for (const [key, value] of previous) {
        if (!Array.isArray(value)) continue;
        const found = value.find((t: any) => t?.id === variables.taskId);
        if (found) {
          fromColumnId = (key as any)?.[1] ?? null;
          taskToMove = found;
          break;
        }
      }

      if (typeof fromColumnId !== 'number' || fromColumnId === nextColumnId || !taskToMove) {
        return { previous };
      }

      queryClient.setQueryData(['tasks', fromColumnId], (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.filter((t: any) => t?.id !== variables.taskId);
      });

      queryClient.setQueryData(['tasks', nextColumnId], (old: any) => {
        const list = Array.isArray(old) ? old : [];
        const updated = {
          ...taskToMove,
          columnId: nextColumnId,
          column_id: nextColumnId,
        };
        return [...list, updated];
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      context?.previous?.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};