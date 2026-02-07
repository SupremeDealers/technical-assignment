import { apiClient } from "./api-client";

export async function getBoards() {
  const res = await apiClient.get("/boards");
  return res.data.data;
}
