import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as tasksApi from '../api/tasks';

export const useBoard = () => {
  return useQuery({
    queryKey: ['board'],
    queryFn: tasksApi.getMyBoard,
  });
};

type TaskQuery = {
  search?: string;
  page?: number;
  limit?: number;
  sort?: tasksApi.TaskSort;
};

const defaultTaskQuery = {
  search: '',
  page: 1,
  limit: 50,
  sort: 'order' as const,
};

export const useTasks = (columnId: number, query?: TaskQuery) => {
  const q = {
    ...defaultTaskQuery,
    ...query,
    search: (query?.search ?? '').trim(),
  };

  return useQuery({
    queryKey: ['tasks', columnId, q.search, q.page, q.limit, q.sort],
    queryFn: () => tasksApi.getTasks(columnId, q),
  });
};

export const useTask = (taskId: number | null) => {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: () => tasksApi.getTask(taskId as number),
    enabled: typeof taskId === 'number' && !Number.isNaN(taskId),
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ columnId, data }: { columnId: number; data: any }) =>
      tasksApi.createTask(columnId, data),
    onSuccess: (_created, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.columnId] });
      queryClient.invalidateQueries({ queryKey: ['board'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: any }) =>
      tasksApi.updateTask(taskId, data),
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['board'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: (_data, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['board'] });
    },
  });
};