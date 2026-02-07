import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/task';
import toast from 'react-hot-toast';

//query
export const useComments = (taskId: string) => {
  return useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => api.getCommentsApi(taskId),
    enabled: !!taskId,
  });
};

//mutation
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createTaskApi,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.columnId] });
      toast.success('Task created');
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateTaskApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); 
      toast.success('Task updated');
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteTaskApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted');
    },
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.addCommentApi,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.taskId] });
      toast.success('Comment posted');
    },
  });
};