import { api } from "./client";

export interface Comment {
  id: number;
  task_id: number;
  user_id: number;
  content: string;
  created_at: string;
  user_email: string;
}

export const getComments = async (taskId: number) => {
  const response = await api.get<Comment[]>(`/tasks/${taskId}/comments`);
  return response.data;
};

export const createComment = async (taskId: number, content: string) => {
  const response = await api.post<Comment>(`/tasks/${taskId}/comments`, { content });
  return response.data;
};