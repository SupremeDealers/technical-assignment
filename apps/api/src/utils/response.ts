import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  errors?: any;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  } as ApiResponse<T>);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: any
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  } as ApiResponse);
};
