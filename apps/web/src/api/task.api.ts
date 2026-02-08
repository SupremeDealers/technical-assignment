import { api } from "./axios";

export async function getTasksByColumn(columnId: number) {
  const { data } = await api.get(
    `/tasks/column/${columnId}`,
  );
  return data;
}

export async function createTask(columnId: number, body: any) {
  const { data } = await api.post(
    `/tasks/column/${columnId}`,
    body,
  );
  return data;
}

export const updateTask = async (
  id: number,
  payload: { title?: string; column_id?: number },
) => {
  const { data } = await api.patch(`/tasks/${id}`, payload);
  return data;
};
export async function deleteTask(taskId: number) {
  const { data } = await api.delete(`/tasks/${taskId}`);
  return data;
}
