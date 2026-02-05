import * as columnRepository from "../repositories/column.repository";
import type { Column } from "../types/entities";

export type PatchColumnInput = { title?: string; position?: number };

export function updateColumn(columnId: number, input: PatchColumnInput): Column {
  const column = columnRepository.update(columnId, input);
  if (!column) {
    throw { code: "NOT_FOUND" as const, message: "Column not found" };
  }
  return column;
}

export function deleteColumn(columnId: number): void {
  const deleted = columnRepository.deleteById(columnId);
  if (!deleted) {
    throw { code: "NOT_FOUND" as const, message: "Column not found" };
  }
}
