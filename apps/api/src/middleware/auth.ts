import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET;

//Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'UNAUTHORIZED', 'Missing or invalid token'));
  }

  const token = authHeader.split(' ')[1];

//   const token = req.cookies?.token;

//   if (!token) {
//     return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
//   }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: 'user' | 'admin';};
    req.user = {userId: decoded.userId, role: decoded.role, };
    next();
  } catch (err) {
    return next(new AppError(401, 'UNAUTHORIZED', 'Invalid or expired token'));
  }
};

// Authorize if user is admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError(401, 'UNAUTHORIZED', 'User not authenticated'));
  }

  if (req.user.role !== 'admin') {
    return next(new AppError(403, 'FORBIDDEN', 'Access denied: Admins only'));
  }

  next();
};