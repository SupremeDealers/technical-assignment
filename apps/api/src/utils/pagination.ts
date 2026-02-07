//! Pagination Utilities
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export type PaginationParams = {
  page: number;
  limit: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
};

//! Helper to convert to positive integer with fallback
function toPositiveInt(value: unknown, fallback: number): number {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return fallback;
  return Math.floor(num);
}

//! Main function to get pagination params safely
export function getPaginationParams(
  page?: string | number,
  limit?: string | number,
): PaginationParams {
  const pageNum = toPositiveInt(page, DEFAULT_PAGE);
  const limitNum = Math.min(MAX_LIMIT, toPositiveInt(limit, DEFAULT_LIMIT));

  return { page: pageNum, limit: limitNum };
}

//! Create paginated response
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams,
): PaginatedResponse<T> {
  const safeTotal = Math.max(0, Math.floor(total));
  const totalPages = safeTotal === 0 ? 1 : Math.ceil(safeTotal / params.limit);

  const response: PaginatedResponse<T> = {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total: safeTotal,
      totalPages,
      hasMore: params.page < totalPages,
    },
  };

  return Object.freeze(response);
}

//! Calculate skip value for MongoDB
export function getSkip(params: PaginationParams): number {
  return Math.max(0, (params.page - 1) * params.limit);
}
