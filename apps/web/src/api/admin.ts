import api from './axios';

//boards
export const getBoardsApi = async () => 
  (await api.get('/boards')).data;

export const createBoardApi = async (name: string) => 
  (await api.post('/admin/boards', { name })).data;

export const deleteBoardApi = async (id: string) => 
  (await api.delete(`/admin/boards/${id}`)).data;

//column
export const getColumnsApi = async (boardId: string) => 
  (await api.get(`/boards/${boardId}/columns`)).data;

export const createColumnApi = async (data: { boardId: string; name: string }) => 
  (await api.post(`/admin/boards/${data.boardId}/columns`, {name: data.name})).data;

export const updateColumnApi = async (data: { id: string; name: string }) => 
  (await api.patch(`/admin/columns/${data.id}`, { name: data.name })).data;

export const deleteColumnApi = async (id: string) => 
  (await api.delete(`/admin/columns/${id}`)).data;