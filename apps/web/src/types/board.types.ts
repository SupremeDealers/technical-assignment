/**
 * Board returned from API
 */
export type Board = {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
};

/**
 * Column returned from API
 */
export type Column = {
  id: string;
  boardId: string;
  name: string;
  position: number;
  taskCount?: number;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
};

/**
 * Inputs (Forms / Mutations)
 */
export type CreateColumnInput = {
  name: string;
  position: number;
};

export type UpdateColumnInput = {
  name?: string;
  position?: number;
};

/**
 * Store / UI State
 */
export type BoardState = {
  boards: Board[];
  activeBoard: Board | null;
  loading: boolean;
};

export type ColumnState = {
  columns: Column[];
  loading: boolean;
};
