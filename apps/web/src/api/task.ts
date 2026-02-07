import api from './axios';

// task
export const getTasksApi = async ({columnId,...query}: { columnId: string; search?: string; sort?: string; page?: number }) => 
  (await api.get(`/columns/${columnId}/tasks`, { params:query })).data;

export const createTaskApi = async (data: { columnId: string; title: string; priority: string }) => 
  (await api.post(`/columns/${data.columnId}/tasks`, data)).data;

export const updateTaskApi = async ({id,...data}: { id: string; title?: string; description?: string; priority?: string; columnId?: string }) => 
  (await api.patch(`/tasks/${id}`, data)).data;

export const deleteTaskApi = async (id: string) => 
  (await api.delete(`/tasks/${id}`)).data;

//comments
export const getCommentsApi = async (taskId: string) => 
  (await api.get(`/tasks/${taskId}/comments`)).data;

export const addCommentApi = async (data: { taskId: string; content: string }) => 
  (await api.post(`/tasks/${data.taskId}/comments`, { content: data.content })).data;