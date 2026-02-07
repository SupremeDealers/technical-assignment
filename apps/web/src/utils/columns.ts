import { apiClient } from "./api-client";

export async function getColumns() {
  const res = await apiClient.get("/columns");
  return res.data;
}
