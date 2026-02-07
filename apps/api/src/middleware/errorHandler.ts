import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ApiError } from '../types';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', err);

  //Handle our Custom AppError
  if (err instanceof AppError) {
    const payload: ApiError = {
      code: err.code,
      message: err.message,
      details: err.details,
    };
    return res.status(err.statusCode).json({ error: payload });
  }

  if ((err as any)?.isJoi) { // Validation errors from joi
    const formattedDetails = (err as any).details.map((detail: any) => ({
      path: detail.path.join('.'),
      issue: detail.message.replace(/"/g, ''),
    }));

    const payload: ApiError = {
      code: 'BAD_REQUEST',
      message: 'Validation failed',
      details: formattedDetails,
    };
    return res.status(400).json({ error: payload });
  }

  //Handle Unexpected Errors
  const payload: ApiError = {
    code: 'INTERNAL',
    message: 'Something went wrong',
  };
  return res.status(500).json({ error: payload });
};