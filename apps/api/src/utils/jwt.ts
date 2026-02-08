import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/api';

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === 'test') {
    return 'test-secret';
  }

  throw new Error('JWT_SECRET is required');
};

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, getSecret(), { expiresIn: '1d' });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, getSecret()) as JwtPayload;
};