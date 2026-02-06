import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/api';

const SECRET = process.env.JWT_SECRET || 'beharsecretkey';

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, SECRET, { expiresIn: '1d' });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, SECRET) as JwtPayload;
};