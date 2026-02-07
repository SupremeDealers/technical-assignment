import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as api from '../api/admin';

export const useBoards = () => {
  return useQuery({ queryKey: ['boards'], queryFn: api.getBoardsApi });
};

export const useCreateBoard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createBoardApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      toast.success('Board created successfully');
    },
  });
};

export const useDeleteBoard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteBoardApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      toast.success('Board deleted');
    },
  });
};

export const useColumns = (boardId: string) => {
  return useQuery({ 
    queryKey: ['columns', boardId], 
    queryFn: () => api.getColumnsApi(boardId),
    enabled: !!boardId 
  });
};

export const useCreateColumn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createColumnApi,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['columns', variables.boardId] });
      toast.success('Column added');
    },
  });
};

export const useUpdateColumn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateColumnApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Column updated');
    },
  });
};

export const useDeleteColumn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteColumnApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Column deleted');
    },
  });
};