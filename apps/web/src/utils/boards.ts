import { Board } from "../types/types";
import { apiClient } from "./api-client";

export async function getBoards() {
  const res = await apiClient.get<Board[]>("/boards");
  return res.data;
}
