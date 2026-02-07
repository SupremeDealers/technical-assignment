import { useQuery } from '@tanstack/react-query';
import * as boardApi from '../api/board';

export const useAllBoards = () => {
  return useQuery({
    queryKey: ['boards'],
    queryFn: boardApi.getAllBoardsApi
  });
};


export const useBoardColumns = (boardId: string | null) => {
  return useQuery({
    queryKey: ['board-columns', boardId],
    queryFn: () => boardApi.getBoardColumnsApi(boardId!),
    enabled: !!boardId
  });
};