import api from './axios';

export const getAllBoardsApi = async () => 
  (await api.get('/boards')).data;

export const getBoardColumnsApi = async (boardId: string) => 
  (await api.get(`/boards/${boardId}/columns`)).data;