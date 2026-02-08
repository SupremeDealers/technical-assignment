import { Request } from "express";

export interface AuthRequest extends Request {
  user_id?: string;
  user?: {
    user_id: string;
    email: string;
    username: string;
  };
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface TaskSearchQuery extends PaginationQuery {
  search?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "";
}
